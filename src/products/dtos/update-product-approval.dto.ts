import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum AdminApprovalAction {
    APPROVE = 'approve',
    REJECT = 'reject',
}

export class UpdateProductApprovalDto {
    @ApiProperty({
        example: 'd6f1a6ce-67b3-4b8e-8f2c-1cf8a63e21f7',
        description: 'The ID of the product to approve or reject',
    })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        example: 'approve',
        enum: AdminApprovalAction,
        description: 'The action to perform on the product approval status',
    })
    @IsEnum(AdminApprovalAction, { message: 'approvalStatus must be either "approve" or "reject"' })
    approvalStatus: AdminApprovalAction;
}