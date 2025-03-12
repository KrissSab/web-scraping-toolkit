import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    controllers: [AccountsController],
    providers: [AccountsService, EncryptionService],
    exports: [AccountsService],
})
export class AccountsModule {}
