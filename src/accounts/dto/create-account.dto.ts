import { IsEmail, IsIP, IsStrongPassword } from 'class-validator';

export class CreateAccountDto {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

    @IsIP()
    ip: string;
}
