import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { AuthDto } from './dto/auth.dto'
import { PrismaService } from '../prisma.service'
import { faker } from '@faker-js/faker/locale/ar'
import { hash, verify } from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(private  prisma: PrismaService, private jwt: JwtService)  {}

	async login(dto: AuthDto){
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokens(user.id)

		return { user: this.returnUserFields(user), ...tokens }
	}

	async getNewTokens(refreshToken: string){
		const result = await this.jwt.verifyAsync(refreshToken)

		if(!result) throw new UnauthorizedException('Invalid refresh token')

		const user = await this.prisma.user.findUnique({where: {id: result.id}})
		const tokens = await this.issueTokens(user.id)

		return { user: this.returnUserFields(user), ...tokens }
	}


	async register(dto: AuthDto){
		const isUserExist = await this.prisma.user.findUnique({where: {email: dto.email}})

		if(isUserExist) throw new BadRequestException('User already exists')

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: await  hash(dto.password),
				name: faker.person.firstName(),
				avatar: faker.image.avatar(),
				phone: faker.phone.number(),
			}
		})

		const tokens = await this.issueTokens(user.id)

		return { user: this.returnUserFields(user), ...tokens }
	}


	private async issueTokens(userId: string){
		const data = {id: userId}
		const accessToken = this.jwt.sign(data, {expiresIn: '1h'})
		const refreshToken = this.jwt.sign(data, {expiresIn: '7d'})

		return {accessToken, refreshToken}
	}


	private returnUserFields(user: User){
		return { id: user.id, email: user.email }
	}

	private async validateUser(dto: AuthDto){
		const user  = await this.prisma.user.findUnique({where: {email: dto.email }})

		if(!user) throw  new NotFoundException('No user found')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('email or password incorrect')

		return user
	}
}
