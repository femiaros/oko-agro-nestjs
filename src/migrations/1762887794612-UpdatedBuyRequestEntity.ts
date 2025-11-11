import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedBuyRequestEntity1762887794612 implements MigrationInterface {
    name = 'UpdatedBuyRequestEntity1762887794612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_orderstate_enum" AS ENUM('awaiting_shipping', 'in_transit', 'delivered', 'completed')`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "orderState" "public"."buy_requests_orderstate_enum"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "orderStateTime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "paymentConfirmed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "paymentConfirmedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "paymentConfirmedAt"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "paymentConfirmed"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "orderStateTime"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "orderState"`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_orderstate_enum"`);
    }

}
