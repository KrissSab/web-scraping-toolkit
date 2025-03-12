import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ConfigService } from '@nestjs/config';

describe('AccountsController', () => {
    let controller: AccountsController;
    let service: AccountsService;

    const mockAccount = {
        id: '1',
        email: 'test@example.com',
        password: 'StrongPass123!',
    };

    const mockAccounts = [mockAccount];

    const validCreateAccountDto: CreateAccountDto = {
        email: 'new@example.com',
        password: 'NewStrongPass123!',
        ip: '',
    };

    const validUpdateAccountDto: UpdateAccountDto = {
        email: 'updated@example.com',
    };

    const mockAccountsService = {
        findOne: jest.fn().mockResolvedValue(mockAccount),
        findAll: jest.fn().mockResolvedValue(mockAccounts),
        create: jest
            .fn()
            .mockImplementation((dto) =>
                Promise.resolve({ id: 'new-id', ...dto }),
            ),
        update: jest
            .fn()
            .mockImplementation((id, dto) =>
                Promise.resolve({ id, ...mockAccount, ...dto }),
            ),
        remove: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'API_KEY') return 'test-api-key';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountsController],
            providers: [
                {
                    provide: AccountsService,
                    useValue: mockAccountsService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                ApiKeyGuard,
            ],
        })
            .overrideGuard(ApiKeyGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AccountsController>(AccountsController);
        service = module.get<AccountsService>(AccountsService);
    });

    describe('findOne', () => {
        it('should return a single account', async () => {
            const result = await controller.findOne(1);
            expect(result).toEqual(mockAccount);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('findAll', () => {
        it('should return an array of accounts', async () => {
            const result = await controller.findAll();
            expect(result).toEqual(mockAccounts);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create a new account', async () => {
            const result = await controller.create(validCreateAccountDto);

            expect(result).toEqual({
                id: 'new-id',
                ...validCreateAccountDto,
            });
            expect(service.create).toHaveBeenCalledWith(validCreateAccountDto);
        });
    });

    describe('update', () => {
        it('should update an account', async () => {
            const result = await controller.update(1, validUpdateAccountDto);

            expect(result).toEqual({
                id: '1',
                ...mockAccount,
                ...validUpdateAccountDto,
            });
            expect(service.update).toHaveBeenCalledWith(
                1,
                validUpdateAccountDto,
            );
        });
    });

    describe('remove', () => {
        it('should remove an account', async () => {
            const result = await controller.remove(1);
            expect(result).toEqual({ id: '1' });
            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
