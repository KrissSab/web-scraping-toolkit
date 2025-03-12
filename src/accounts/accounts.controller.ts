import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { Account } from './entities/account.entity';

class AccountListResponse {
    id: number;
    email: string;
}

class AccountResponse extends Account {
    id: number;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

class UpdateAccountResponse {
    id: number;
    email?: string;
    updatedAt: Date;
}

@ApiTags('Accounts')
@ApiBearerAuth('X-API-Key')
@Controller('accounts')
@UseGuards(ApiKeyGuard)
@ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid API key or missing authentication',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error occurred while processing the request',
})
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create new account',
        description: 'Creates a new account',
    })
    @ApiBody({
        type: CreateAccountDto,
        description:
            'Account data including email, password and proxy information',
        examples: {
            examples: {
                summary: 'Standard account with proxy',
                description:
                    'Example of creating an account with full proxy details',
                value: {
                    email: 'user@example.com',
                    password: 'securePassword123',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Account successfully created',
        type: AccountResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Bad Request - Invalid input data (missing required fields or format errors)',
    })
    @ApiConflictResponse({
        description: 'Conflict - Account with provided email already exists',
    })
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountsService.create(createAccountDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all accounts',
        description:
            'Returns a list of all accounts with limited information (id and email only)',
    })
    @ApiOkResponse({
        description: 'List of accounts retrieved successfully',
        type: [AccountListResponse],
    })
    findAll(): Promise<{ id: number; email: string }[]> {
        return this.accountsService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get account by ID',
        description:
            'Returns detailed information about a specific account including decrypted credentials',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'Account unique identifier',
        type: 'number',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Account retrieved successfully',
        type: AccountResponse,
    })
    @ApiNotFoundResponse({
        description: 'Account with specified ID not found',
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update account',
        description:
            'Updates account information including credentials and proxy settings',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'Account unique identifier',
        type: 'number',
        example: 1,
    })
    @ApiBody({
        type: UpdateAccountDto,
        description: 'Fields to update (all fields are optional)',
    })
    @ApiOkResponse({
        description: 'Account successfully updated',
        type: UpdateAccountResponse,
    })
    @ApiNotFoundResponse({
        description: 'Account with specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Bad Request - Invalid input data format',
    })
    @ApiConflictResponse({
        description:
            'Conflict - Updated email already exists for another account',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAccountDto: UpdateAccountDto,
    ) {
        return this.accountsService.update(id, updateAccountDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete account',
        description: 'Permanently removes an account from the database',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'Account unique identifier',
        type: 'number',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Account successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Account with specified ID not found',
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.remove(id);
    }
}
