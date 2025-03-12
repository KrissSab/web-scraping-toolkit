import { Repository } from 'typeorm';
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private accountRepository: Repository<Account>,
        private readonly encryptionService: EncryptionService,
    ) {}

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        try {
            const { email, password, ip } = createAccountDto;

            const encryptedPassword = this.encryptionService.encrypt(password);

            const account = this.accountRepository.create({
                email,
                password: encryptedPassword,
                ip,
            });

            await this.accountRepository.save(account);

            delete account.password;

            return account;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException(
                    `Account with email: ${createAccountDto.email} already exists!`,
                );
            }
            throw new InternalServerErrorException(
                `Error while creating account: ${error.message}`,
            );
        }
    }

    async findAll(): Promise<{ id: number; email: string }[]> {
        return await this.accountRepository.find({
            select: ['id', 'email'],
        });
    }

    async update(
        id: number,
        updateAccountDto: UpdateAccountDto,
    ): Promise<Partial<Account> & { id: number; updatedAt: Date }> {
        try {
            const updateData: Partial<Account> = {
                ...updateAccountDto,
                updatedAt: new Date(),
            };

            if (updateAccountDto.password) {
                updateData.password = this.encryptionService.encrypt(
                    updateAccountDto.password,
                );
            }

            const updateResult = await this.accountRepository.update(
                id,
                updateData,
            );

            if (updateResult.affected === 0) {
                throw new NotFoundException(`Account with id ${id} not found`);
            }

            return {
                id,
                ...updateAccountDto,
                updatedAt: updateData.updatedAt,
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException(
                    `Account with this email already exists!`,
                );
            }
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error while updating account: ${error.message}`,
            );
        }
    }

    async findOne(id: number): Promise<Account> {
        try {
            const account = await this.accountRepository.findOne({
                where: { id },
            });

            if (!account) {
                throw new NotFoundException(
                    `Account with ID: ${id} not found!`,
                );
            }

            const decryptedPassword = this.encryptionService.decrypt(
                account.password,
            );

            const accountWithDecryptedData = {
                ...account,
                password: decryptedPassword,
            };

            return accountWithDecryptedData;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error while fetching account: ${error.message}`,
            );
        }
    }

    async remove(id: number) {
        const result = await this.accountRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Account with ID: ${id} not found!`);
        }
    }
}
