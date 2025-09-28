import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductPhotosDto } from './dtos/update-product-photos.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
    
    @Post('create')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async createProduct(@Body() dto: CreateProductDto, @CurrentUser() currentUser: User) {
        return this.productsService.createProduct(dto, currentUser);
    }

    @Patch('update')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateProduct(@Body() dto: UpdateProductDto, @CurrentUser() currentUser: User) {
        return this.productsService.updateProduct(dto, currentUser);
    }

    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async findUserProducts(@Param('userId') userId: string) {
        return this.productsService.findUserProducts(userId);
    }

    @Get(':productId')
    @HttpCode(HttpStatus.OK)
    async findProduct(@Param('productId') productId: string) {
        return this.productsService.findProduct(productId);
    }

    @Delete('remove-photo/:photoId')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async removeProductPhoto(@Param('photoId') photoId: string) {
        return this.productsService.removeProductPhoto(photoId);
    }

    @Post('upload-photo')
    @HttpCode(HttpStatus.CREATED)
    async uploadProductPhotos(@Body() dto: UpdateProductPhotosDto) {
        return this.productsService.uploadProductPhotos(dto);
    }

    @Delete(':productId')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async deleteProduct(@Param('productId') productId: string, @CurrentUser() currentUser: User) {
        return this.productsService.deleteProduct(productId, currentUser);
    }
}
