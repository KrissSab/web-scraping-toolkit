import * as crypto from 'crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService implements OnModuleInit {
    private readonly algorithm = 'aes-256-cbc';
    private key: Buffer;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY is not provided in configuration');
        }
        this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(text: string): string {
        const [ivHex, encryptedText] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
