import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export class GetAllAdminsQueryDto {
    @ApiPropertyOptional({
        enum: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        description: "Filter by role: 'admin' or 'super_admin'. If omitted, return both.",
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiPropertyOptional({ example: 1 })
    @IsNumberString()
    @IsOptional()
    pageNumber?: number;

    @ApiPropertyOptional({ example: 20 })
    @IsNumberString()
    @IsOptional()
    pageSize?: number;
}
