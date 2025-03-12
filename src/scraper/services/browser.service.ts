import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Browser, chromium } from 'playwright';
import { LoggerService } from '../../logger/logger.service';
import { browserConfiguration } from '../helpers/playwright-browser.config';

@Injectable()
export class BrowserService {
    private static browserInstance: Browser | null = null;

    constructor(private readonly logger: LoggerService) {}

    async getBrowser(): Promise<Browser> {
        if (!BrowserService.browserInstance) {
            try {
                BrowserService.browserInstance = await chromium.launch({
                    ...browserConfiguration,
                });

                BrowserService.browserInstance.on('disconnected', () => {
                    BrowserService.browserInstance = null;
                });

                return BrowserService.browserInstance;
            } catch (error) {
                this.logger.error(error, 'BrowserService.createBrowser');
                throw new InternalServerErrorException(
                    'Error while creating browser instance!',
                );
            }
        }
        return BrowserService.browserInstance;
    }
}
