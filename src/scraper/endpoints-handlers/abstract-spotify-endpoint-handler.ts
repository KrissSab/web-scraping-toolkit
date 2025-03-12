import { Page } from 'playwright';
import {
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { PageService } from '../services/page.service';
import { AccountsService } from '../../accounts/accounts.service';
import { IAccountConfig } from '../interfaces/account-config.interface';
import { IpCheckerPage, LocatorActions } from '../constants';
import { getRandomDelayInRange } from '../helpers/getRandomDelayInRange';
import { IUserContext } from '../interfaces/user-context.interface';

@Injectable()
export abstract class AbstractScraperHandler<
    TArgs extends { accountId: number },
    TResult,
    TRouteHandler = unknown,
> {
    constructor(
        protected readonly pageService: PageService,
        protected readonly accountsService: AccountsService,
        protected readonly logger: LoggerService,
    ) {}

    public async evaluate(args: TArgs): Promise<TResult> {
        const accountConfig = await this.createAccountConfig(args.accountId);
        const page = await this.pageService.createPage(accountConfig);
        const context: IUserContext = { page, accountConfig };

        try {
            //if proxy going to be used
            // await this.validateIP(page, accountConfig.ip);

            const routeHandler = await this.setupRouteHandler(context);

            const url = await this.buildUrl(args);
            await this.pageService.navigateToPage(page, url, args.accountId);
            await page.waitForLoadState('networkidle');
            await this.checkAndHandleAuth(page, accountConfig, url);

            const result = await this.execute(args, context, routeHandler);

            return this.transformResult(result);
        } catch (error) {
            if (error instanceof HttpException) {
                this.logger.error(error, this.constructor.name, {
                    statusCode: error.getStatus(),
                    args,
                });
                throw error;
            }
            this.logger.error(error, this.constructor.name, { args });
            throw new InternalServerErrorException(
                `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
            );
        } finally {
            this.logger.log('Closing page');
            page.waitForTimeout(getRandomDelayInRange(3.2, 6.6)).then(() =>
                this.pageService
                    .closePage(page, accountConfig.id)
                    .then(() => this.logger.log('Page closed'))
                    .catch((error) => {
                        this.logger.error(error, 'evaluate.finally', {
                            accountConfig,
                        });
                    }),
            );
        }
    }

    protected abstract setupRouteHandler(
        context: IUserContext,
    ): Promise<TRouteHandler>;

    protected abstract buildUrl(args: TArgs): Promise<string>;

    protected abstract execute(
        args: TArgs,
        context: IUserContext,
        routeHandler: TRouteHandler,
    ): Promise<unknown>;

    protected abstract transformResult(result: unknown): TResult;

    private async createAccountConfig(
        accountId: number,
    ): Promise<IAccountConfig> {
        const user = await this.accountsService.findOne(accountId);
        return {
            id: '' + user.id,
            email: user.email,
            password: user.password,
            ip: user.ip,
        };
    }

    protected abstract checkAndHandleAuth(
        page: Page,
        accountConfig: IAccountConfig,
        url: string,
    ): Promise<void>;

    /**
     * Navigates to lumtest.com to verify if the IP address from the database matches the actual IP address.
     *
     * @param page
     * @param expectedIP
     */
    private async validateIP(page: Page, expectedIP: string): Promise<void> {
        const ipResponsePromise = page.waitForResponse((response) => {
            return response.url().includes('myip');
        });
        await this.pageService.navigateToPage(page, IpCheckerPage);
        const ipResponse = await ipResponsePromise;
        const response = await ipResponse.json();
        const { ip } = response;
        if (!expectedIP.includes(ip)) {
            throw new InternalServerErrorException({
                message: `Expected and current IP of account doesn't match`,
                expectedIP,
                currentIP: ip,
            });
        }
    }
}
