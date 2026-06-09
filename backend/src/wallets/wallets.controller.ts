import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';
import { CreateWalletDto, UpdateWalletDto, TransferDto } from './wallet.dto';

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wallets for current user' })
  @ApiResponse({ status: 200, description: 'List of wallets', type: [Wallet] })
  findAll(@Request() req: any): Promise<Wallet[]> {
    return this.walletsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet details', type: Wallet })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  findOne(@Param('id') id: string, @Request() req: any): Promise<Wallet> {
    return this.walletsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created', type: Wallet })
  create(@Body() createDto: CreateWalletDto, @Request() req: any): Promise<Wallet> {
    return this.walletsService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet updated', type: Wallet })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWalletDto,
    @Request() req: any,
  ): Promise<Wallet> {
    return this.walletsService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet deleted' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.walletsService.delete(id, req.user.id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds between wallets' })
  @ApiResponse({ status: 200, description: 'Transfer successful', type: [Wallet] })
  @ApiResponse({ status: 400, description: 'Insufficient funds' })
  transfer(@Body() transferDto: TransferDto, @Request() req: any): Promise<Wallet[]> {
    return this.walletsService.transfer(req.user.id, transferDto);
  }
}