import { MigrationInterface, QueryRunner } from "typeorm";

export class BuyRequestRevamped1765376079776 implements MigrationInterface {
    name = 'BuyRequestRevamped1765376079776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "removeLater" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "removeLater"`);
    }

}
