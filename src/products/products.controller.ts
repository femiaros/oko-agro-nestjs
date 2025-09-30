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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
    
    @ApiOperation({ summary: 'Create a new product (farmers only)' })
    @Post('create')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async createProduct(@Body() dto: CreateProductDto, @CurrentUser() currentUser: User) {
        return this.productsService.createProduct(dto, currentUser);
    }

    @ApiOperation({ summary: 'Update a product (Only user who created the event can update)' })
    @Patch('update')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateProduct(@Body() dto: UpdateProductDto, @CurrentUser() currentUser: User) {
        return this.productsService.updateProduct(dto, currentUser);
    }

    @ApiOperation({ summary: `Fetch a user's list of products with :userId` })
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async findUserProducts(@Param('userId') userId: string) {
        return this.productsService.findUserProducts(userId);
    }

    @ApiOperation({ summary: 'Fetch product with :productId' })
    @Get(':productId')
    @HttpCode(HttpStatus.OK)
    async findProduct(@Param('productId') productId: string) {
        return this.productsService.findProduct(productId);
    }

    @ApiOperation({ summary: `Delete a product photo (Only the owner)` })
    @Delete('remove-photo/:photoId')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async removeProductPhoto(@Param('photoId') photoId: string) {
        return this.productsService.removeProductPhoto(photoId);
    }

    @ApiOperation({ summary: `Upload photo(s) for a product (Only the owner` })
    @Post('upload-photo')
    @HttpCode(HttpStatus.CREATED)
    async uploadProductPhotos(@Body() dto: UpdateProductPhotosDto) {
        return this.productsService.uploadProductPhotos(dto);
    }

    @ApiOperation({ summary: `Delete a product (Only the owner can deleted)` })
    @Delete(':productId')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async deleteProduct(@Param('productId') productId: string, @CurrentUser() currentUser: User) {
        return this.productsService.deleteProduct(productId, currentUser);
    }
}
