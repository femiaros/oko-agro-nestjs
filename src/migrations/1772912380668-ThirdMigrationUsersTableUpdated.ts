import { MigrationInterface, QueryRunner } from "typeorm";

export class ThirdMigrationUsersTableUpdated1772912380668 implements MigrationInterface {
    name = 'ThirdMigrationUsersTableUpdated1772912380668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "buyRequestCompleted" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "totalFarmerSalesAmount" numeric(30,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "totalProcessorPurchasesAmount" numeric(30,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`CREATE INDEX "IDX_82d2ea5f3f8a99449e541918b5" ON "users" ("country") `);
        await queryRunner.query(`CREATE INDEX "IDX_27ae2293c06e67afd956671710" ON "users" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_ad1bffe82bc96e5877efaf0331" ON "users" ("buyRequestCompleted") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ad1bffe82bc96e5877efaf0331"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27ae2293c06e67afd956671710"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82d2ea5f3f8a99449e541918b5"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "totalProcessorPurchasesAmount"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "totalFarmerSalesAmount"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "buyRequestCompleted"`);
    }

}
