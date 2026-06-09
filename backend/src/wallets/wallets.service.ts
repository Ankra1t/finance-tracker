import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './wallet.entity';
import { CreateWalletDto, UpdateWalletDto, TransferDto } from './wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: string): Promise<Wallet[]> {
    return this.walletRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id, userId } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async create(userId: string, createDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({ ...createDto, userId });
    return this.walletRepository.save(wallet);
  }

  async update(id: string, userId: string, updateDto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, updateDto);
    return this.walletRepository.save(wallet);
  }

  async delete(id: string, userId: string): Promise<void> {
    const wallet = await this.findOne(id, userId);
    await this.walletRepository.remove(wallet);
  }

  async transfer(userId: string, transferDto: TransferDto): Promise<Wallet[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromWallet = await this.findOne(transferDto.fromWalletId, userId);
      const toWallet = await this.findOne(transferDto.toWalletId, userId);

      if (fromWallet.balance < transferDto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      fromWallet.balance = Number(fromWallet.balance) - transferDto.amount;
      toWallet.balance = Number(toWallet.balance) + transferDto.amount;

      await queryRunner.manager.save(fromWallet);
      await queryRunner.manager.save(toWallet);

      await queryRunner.commitTransaction();
      return [fromWallet, toWallet];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBalance(id: string, amount: number, isAddition: boolean): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    wallet.balance = isAddition
      ? Number(wallet.balance) + amount
      : Number(wallet.balance) - amount;
    return this.walletRepository.save(wallet);
  }
}