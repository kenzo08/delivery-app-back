import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UsePipes(new ValidationPipe())
  @Get()
  async getAll(@Query('searchQuery') searchQuery: string){
    return this.productService.getAll(searchQuery)
  }

  @Get('by-slug/:slug')
    async getProductBySlug(@Param('slug') slug: string){
      return this.productService.getBySlug(slug)
    }

    @Get('by-category/:categorySlug')
    async getProductsByCategory(@Param('categorySlug') categorySlug: string){
    return this.productService.getByCategory(categorySlug)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post()
  async createProduct() {
    return this.productService.create()
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.productService.update(id, dto)
  }

  @HttpCode(200)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id)
  }
}
