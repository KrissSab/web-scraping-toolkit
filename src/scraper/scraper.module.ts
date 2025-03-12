import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { PageService } from './services/page.service';
import { ContextService } from './services/context.service';
import { StorageService } from './services/storage.service';
import { BrowserService } from './services/browser.service';

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    providers: [
        BrowserService,
        PageService,
        ContextService,
        StorageService,
        LoggerService,
        AccountsService,
        EncryptionService,
    ],
})
export class ScraperModule {}
