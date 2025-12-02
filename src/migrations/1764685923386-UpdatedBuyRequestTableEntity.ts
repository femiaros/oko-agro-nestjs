import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedBuyRequestTableEntity1764685923386 implements MigrationInterface {
    name = 'UpdatedBuyRequestTableEntity1764685923386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "paymentAmount" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "paymentAmount" SET NOT NULL`);
    }

}
