import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsIP, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
    @IsString()
    @IsOptional()
    email?: string;

    @IsStrongPassword()
    @IsOptional()
    password?: string;

    @IsIP()
    ip?: string;
}
