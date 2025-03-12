import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { AccountsModule } from './accounts/accounts.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
    imports: [ConfigurationModule, AccountsModule, ScraperModule],
    providers: [],
    exports: [],
})
export class AppModule {}
