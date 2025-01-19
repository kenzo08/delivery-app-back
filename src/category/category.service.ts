import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { returnCategoryObject } from './return-category.object'
import { CategoryDto } from './dto/CategoryDto'
import { generateSlug } from '../utils/generate-slug'

@Injectable()
export class CategoryService {
	constructor(private prismaService: PrismaService) {}

	async getAll(){
		return this.prismaService.category.findMany({
			select: returnCategoryObject
		})
	}

	async getById(id: string){
	const category  = await this.prismaService.category.findUnique({
		where: {id},
		select: returnCategoryObject
	})

		if(!category) throw new NotFoundException(`Category with id ${id} not found`)

		return category
	}

	async getBySlug(slug: string){
		const category  = await this.prismaService.category.findUnique({
			where: {slug},
			select: returnCategoryObject
		})

		if(!category) throw new NotFoundException(`Category with slug ${slug} not found`)

		return category
	}

	async create(){
		return this.prismaService.category.create({
			data: {
				name: '',
				image: '',
				slug: '',
			}
		})
	}

	async update(id: string, dto: CategoryDto){
		return this.prismaService.category.update({
			where: {id},
			data: {
				name: dto.name,
				image: dto.image,
				slug: generateSlug(dto.name),
			}
		})
	}

	async delete(id: string){
		return this.prismaService.category.delete({where: {id}})
	}
}
