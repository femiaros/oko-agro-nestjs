import {IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePurchaseOrderDocDto {
    @ApiProperty({ example: 'b123-456-789', description: 'ID of the buyRequest to update' })
    @IsString()
    @IsNotEmpty()
    buyRequestId: string; 

    @ApiProperty({ example: "8hfeiweji9rfwjkowstring64jjhgfutftydrsetatearsdydyuyvvkikfvjiijgiogegntr.#tt6yu" })
    @IsNotEmpty()
    @IsString()
    purchaseOrderDoc: string; 
}