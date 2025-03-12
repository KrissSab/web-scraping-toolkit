import { Page } from 'playwright';
import { IAccountConfig } from './account-config.interface';

export interface IUserContext {
    page: Page;
    accountConfig: IAccountConfig;
}
