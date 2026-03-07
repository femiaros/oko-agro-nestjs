import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { UserRole } from "src/users/entities/user.entity";

export class TopPerformingUsersQueryDto {
    @ApiPropertyOptional({
        enum: [UserRole.FARMER, UserRole.PROCESSOR],
        description: "Filter by role: 'farmer' or 'processor'.",
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}