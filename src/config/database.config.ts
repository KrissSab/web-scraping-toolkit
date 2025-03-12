import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],
}));
