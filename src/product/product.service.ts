import { Injectable, NotFoundException } from '@nestjs/common'
import { generateSlug } from '../utils/generate-slug'
import { PrismaService } from '../prisma.service'
import { ProductDto } from './dto/product.dto'
import { returnProductObject } from './return-product.object'
import { CategoryService } from '../category/category.service'

@Injectable()
export class ProductService {
	constructor(private prismaService: PrismaService, private categoryService: CategoryService) {}

	async getAll(searchQuery?: string){

		if(searchQuery) return this.search(searchQuery)

		return this.prismaService.product.findMany({
			select: returnProductObject,
			orderBy: { createdAt: 'desc' },
		})
	}

	async search(searchQuery: string){
		return this.prismaService.product.findMany({
			where: { OR: [
					{
						name: { contains: searchQuery, mode: 'insensitive' },
					},
					{
						description: { contains: searchQuery, mode: 'insensitive' },
					}
				]
			},
			select: returnProductObject
		})
	}

	async getById(id: string){
		const product  = await this.prismaService.product.findUnique({
			where: {id},
			select: returnProductObject
		})

		if(!product) throw new NotFoundException(`Product with id ${id} not found`)

		return product
	}

	async getBySlug(slug: string){
		const product  = await this.prismaService.product.findUnique({
			where: {slug},
			select: returnProductObject
		})

		if(!product) throw new NotFoundException(`Product with slug ${slug} not found`)

		return product
	}

	async getByCategory(categorySlug: string){
		const product  = await this.prismaService.product.findMany({
			where: {category: {slug:categorySlug}},
			select: returnProductObject
		})

		if(!product) throw new NotFoundException(`Product with category slug ${categorySlug} not found`)

		return product
	}

	async create(){
		return this.prismaService.product.create({
			data: {
				name: '',
				image: '',
				slug: '',
				description: '',
				price: 0,
			}
		})
	}

	async update(id: string, dto: ProductDto){

		const { name, description, image, price, categoryId } = dto

		await this.categoryService.getById(categoryId)

		return this.prismaService.product.update({
			where: {id},
			data: {
				name,
				description,
				image,
				slug: generateSlug(name),
				category: { connect: { id: categoryId }, }
			}
		})
	}

	async delete(id: string){
		return this.prismaService.product.delete({where: {id}})
	}
}
