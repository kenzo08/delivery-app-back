import { Prisma } from "@prisma/client";
import { returnCategoryObject } from '../category/return-category.object'

export const returnProductObject: Prisma.ProductSelect = {

	id: true,
	name: true,
	description: true,
	image: true,
	slug: true,
	createdAt: true,
	updatedAt: true,
	category: {select: returnCategoryObject }
}