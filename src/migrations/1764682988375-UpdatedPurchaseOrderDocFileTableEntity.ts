import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPurchaseOrderDocFileTableEntity1764682988375 implements MigrationInterface {
    name = 'UpdatedPurchaseOrderDocFileTableEntity1764682988375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" ADD "buyRequestId" uuid`);
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" ADD CONSTRAINT "UQ_fd21d9270e77e2727e39a557237" UNIQUE ("buyRequestId")`);
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" ADD CONSTRAINT "FK_fd21d9270e77e2727e39a557237" FOREIGN KEY ("buyRequestId") REFERENCES "buy_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" DROP CONSTRAINT "FK_fd21d9270e77e2727e39a557237"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" DROP CONSTRAINT "UQ_fd21d9270e77e2727e39a557237"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_doc_files" DROP COLUMN "buyRequestId"`);
    }

}
