import {
    CanActivate,
    ExecutionContext,
    Injectable,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate, OnModuleInit {
    private apiKey: string;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        this.apiKey = this.configService.get<string>('API_KEY');
        if (!this.apiKey) {
            throw new Error('API_KEY is not provided in configuration');
        }
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        if (!apiKey || apiKey !== this.apiKey) {
            throw new UnauthorizedException('Invalid API key');
        }
        return true;
    }
}
