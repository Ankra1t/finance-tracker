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
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for current user' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [Category] })
  findAll(@Request() req: any): Promise<Category[]> {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category details', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string, @Request() req: any): Promise<Category> {
    return this.categoriesService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created', type: Category })
  create(@Body() createDto: CreateCategoryDto, @Request() req: any): Promise<Category> {
    return this.categoriesService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
    @Request() req: any,
  ): Promise<Category> {
    return this.categoriesService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.categoriesService.delete(id, req.user.id);
  }
}