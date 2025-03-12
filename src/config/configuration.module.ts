import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { databaseConfig } from './database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            ignoreEnvFile:
                process.env.NODE_ENV !== 'dev' &&
                process.env.NODE_ENV !== 'test',
            load: [databaseConfig],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
                entities: [Account],
                autoLoadEntities: true,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class ConfigurationModule {}
