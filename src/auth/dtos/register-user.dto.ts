import { IsString, IsEmail, IsNotEmpty, IsEnum, IsArray, IsOptional, MinLength } from "class-validator";
import { BusinessType, FarmSizeUnit, OperatingDaysPerWeek, ProcesssingCapacityUnit, UserRole } from "src/users/entities/user.entity";

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

    @IsString()
    @IsOptional()
    farmSize?: string;

    @IsEnum(FarmSizeUnit)
    @IsOptional()
    farmSizeUnit?: FarmSizeUnit;

    @IsString()
    @IsOptional()
    estimatedAnnualProduction?: string;

    // Crops (array of crop IDs from frontend)
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    cropIds?: string[];

    // Processor Company specific Info
    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    businessRegNumber?: string;

    @IsString()
    @IsOptional()
    yearEstablished?: string;

    @IsEnum(BusinessType)
    @IsOptional()
    businessType?: BusinessType;

    @IsString()
    @IsOptional()
    processsingCapacitySize?: string;

    @IsEnum(ProcesssingCapacityUnit)
    @IsOptional()
    processsingCapacityUnit?: ProcesssingCapacityUnit;

    @IsEnum(OperatingDaysPerWeek)
    @IsOptional()
    operatingDaysPerWeek?: OperatingDaysPerWeek;

    @IsString()
    @IsOptional()
    storageCapacity?: string;

    @IsString()
    @IsOptional()
    minimumOrderQuality?: string;

    @IsString()
    @IsOptional()
    OperationsType?: string;

    // Quality Standards & Certifications
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    qualityStandardIds?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    certificationIds?: string[];

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
    @IsOptional()
    userPhoto?: string;

    // Document Verification (base64 strings for jpeg/png/pdf)
    @IsString()
    @IsOptional()
    businessRegCertDoc?: string;

    @IsString()
    @IsOptional()
    taxIdCertDoc?: string;

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
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}