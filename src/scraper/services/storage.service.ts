import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BrowserContext } from 'playwright';

interface PlaywrightCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
}
interface LocalStorageItem {
    name: string;
    value: string;
}
interface Origin {
    origin: string;
    localStorage: LocalStorageItem[];
}
interface PlaywrightStorageState {
    cookies: PlaywrightCookie[];
    origins: Origin[];
}

@Injectable()
export class StorageService implements OnApplicationBootstrap {
    private readonly baseStorageDir = './storage-states';

    constructor(private readonly logger: LoggerService) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.ensureBaseDirectory();
    }

    private async ensureBaseDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.baseStorageDir, { recursive: true });
        } catch (error) {
            this.logger.error(error, 'StorageService.ensureBaseDirectory', {
                storageDir: this.baseStorageDir,
            });
            throw error;
        }
    }

    async getStorageStatePath(accountId: string): Promise<string> {
        try {
            return path.join(this.baseStorageDir, `${accountId}-state.json`);
        } catch (error) {
            this.logger.error(error, 'StorageService.getStorageStatePath', {
                accountId,
            });
            throw error;
        }
    }

    async loadStorageState(accountId: string): Promise<PlaywrightStorageState> {
        const statePath = await this.getStorageStatePath(accountId);
        try {
            const exists = await fs
                .access(statePath)
                .then(() => true)
                .catch(() => false);
            if (exists) {
                const data = await fs.readFile(statePath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            this.logger.error(error, 'StorageService.loadStorageState', {
                accountId,
            });
        }
        return {
            cookies: [],
            origins: [],
        };
    }

    async saveStorageState(
        context: BrowserContext,
        accountId: string,
    ): Promise<void> {
        const statePath = await this.getStorageStatePath(accountId);
        try {
            if (context && !context.browser()?.isConnected()) {
                this.logger.log(
                    `Context already closed for account ${accountId}`,
                );
                return;
            }
            await context.storageState({ path: statePath });
        } catch (error) {
            this.logger.error(error, 'PlaywrightService.saveStorageState', {
                accountId,
            });
        }
    }
}
