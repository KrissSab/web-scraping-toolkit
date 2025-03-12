import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IAccountConfig } from '../interfaces/account-config.interface';
import { Page } from 'playwright';
import { LoggerService } from '../../logger/logger.service';
import { ContextService } from './context.service';
import { StorageService } from './storage.service';
import { LocatorActions } from '../constants';

@Injectable()
export class PageService {
    constructor(
        private readonly contextService: ContextService,
        private readonly storageService: StorageService,
        private readonly logger: LoggerService,
    ) {}

    async createPage(accountConfig: IAccountConfig): Promise<Page> {
        let context = this.contextService.getContext(accountConfig.id);
        if (!context) {
            context = await this.contextService.createContext(accountConfig);
        }
        return await context.newPage();
    }

    async closePage(page: Page, accountId: string): Promise<void> {
        const context = page.context();

        try {
            await this.storageService.saveStorageState(context, accountId);
        } catch (error) {
            this.logger.error(error, 'PlaywrightService.closePage', {
                accountId,
            });
        }

        await page.close();
    }

    async applyAction(
        page: Page,
        elementXpath: string,
        action: LocatorActions,
        options?: { value?: string | number | null; timeout?: number },
    ): Promise<void | string> {
        const locator = page.locator(`xpath=${elementXpath}`);
        try {
            type LocatorAction = (
                value?: string | number | null,
                options?: unknown,
            ) => Promise<void | string>;
            const { value = null, ...restOptions } = options || {};
            return await (locator[action] as LocatorAction)(value, restOptions);
        } catch (error) {
            this.logger.error(error, 'PageService.applyAction', {
                elementXpath,
                action,
                value: options.value,
            });
            throw new InternalServerErrorException(
                `Error while applying ${action} action to ${elementXpath} element!`,
            );
        }
    }

    async navigateToPage(
        page: Page,
        url: string,
        accountId?: number,
    ): Promise<void> {
        try {
            await page.goto(url);
        } catch (error) {
            this.logger.error(error, 'PageService.navigateToPage', {
                url,
                accountId,
            });
            throw new InternalServerErrorException(
                `Error while opening url: ${url}`,
            );
        }
    }

    async reloadPage(page: Page): Promise<void> {
        try {
            await page.reload({ waitUntil: 'load' });
        } catch (error) {
            this.logger.error(error, 'PageService.reloadPage');
            throw new InternalServerErrorException(
                'Error while reloading the page',
            );
        }
    }
}
