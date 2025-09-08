import { IsString, IsEmail, IsNotEmpty, IsEnum, IsArray, IsNumber, IsOptional } from "class-validator";
import { FarmSizeUnit, UserRole } from "src/users/entities/user.entity";

export class RegisterUserDto {
    // Basic Info
    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    firstName: string;

    @IsString()
    @IsNotEmpty({message: 'LastName is required'})
    lastName: string;

    @IsEmail({}, {message: 'Provide a valid email'})
    @IsNotEmpty({message: 'Email is required'})
    email: string;

    @IsString()
    @IsNotEmpty({message: 'PhoneNumber is required'})
    phoneNumber: string;

    @IsString()
    @IsOptional()
    farmAddress?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    state?: string;

    // Farm Details
    @IsString()
    @IsOptional()
    farmName?: string;

    @IsNumber()
    @IsOptional()
    farmSize?: number;

    @IsEnum(FarmSizeUnit)
    @IsOptional()
    unit?: FarmSizeUnit;

    @IsNumber()
    @IsOptional()
    estimatedAnnualProduction?: number;

    // Crops (array of crop IDs from frontend)
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    cropIds?: string[];

    // Experience Assessment
    @IsString()
    @IsOptional()
    farmingExperience?: string;

    @IsString()
    @IsOptional()
    internetAccess?: string;

    @IsString()
    @IsOptional()
    howUserSellCrops?: string;

    // Picture Verification (base64 strings)
    @IsString()
    @IsOptional()
    farmPhoto?: string;

    @IsString()
    @IsNotEmpty({message: 'UserPhoto is required'})
    userPhoto?: string;

    // Payment Setup
    @IsString()
    @IsOptional()
    bankName?: string;

    @IsString()
    @IsOptional()
    accountNumber?: string;

    // System Role
    @IsEnum(UserRole)
    role: UserRole;

    // Auth fields
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}