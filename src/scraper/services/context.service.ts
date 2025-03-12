import { Injectable } from '@nestjs/common';
import { BrowserContext } from 'playwright';
import { browserConfiguration } from '../helpers/playwright-browser.config';
import { IAccountConfig } from '../interfaces/account-config.interface';
import { LoggerService } from '../../logger/logger.service';
import { StorageService } from './storage.service';
import { BrowserService } from './browser.service';

@Injectable()
export class ContextService {
    private readonly contextMap: Map<string, BrowserContext> = new Map();

    constructor(
        private readonly browserService: BrowserService,
        private readonly storageService: StorageService,
        private readonly logger: LoggerService,
    ) {}

    async createContext(
        accountConfig: IAccountConfig,
    ): Promise<BrowserContext> {
        const browser = await this.browserService.getBrowser();
        const storageState = await this.storageService.loadStorageState(
            accountConfig.id,
        );
        try {
            const context = await browser.newContext({
                ...browserConfiguration,
                proxy: accountConfig.proxy,
                storageState,
            });
            this.contextMap.set(accountConfig.id, context);
            context.on('close', () => {
                this.contextMap.delete(accountConfig.id);
            });
            return context;
        } catch (error) {
            this.logger.error(error, 'ContextService.createContext', {
                accountConfig,
            });
            throw error;
        }
    }

    getContext(accountId: string): BrowserContext | undefined {
        this.logger.log(`Amount of contexts: ${this.contextMap.size}`);
        return this.contextMap.get(accountId);
    }
}
