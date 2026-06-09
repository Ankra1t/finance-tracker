import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(userId: string, createDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({ ...createDto, userId });
    return this.categoryRepository.save(category);
  }

  async update(id: string, userId: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id, userId);
    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoryRepository.remove(category);
  }
}