import { MigrationInterface, QueryRunner } from "typeorm";

export class EventsAndCropsTableModified1765921276254 implements MigrationInterface {
    name = 'EventsAndCropsTableModified1765921276254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "cropQuantity" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."crop_quantity_unit_enum" AS ENUM('kilogram', 'tonne')`);
        await queryRunner.query(`ALTER TABLE "events" ADD "cropQuantityUnit" "public"."crop_quantity_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "isHarvestEvent" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "events" ADD "cropId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."buy_requests_preferredpaymentmethod_enum" RENAME TO "buy_requests_preferredpaymentmethod_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_preferredpaymentmethod_enum" AS ENUM('pay_on_delivery', 'cash_and_carry', 'five_days_post_delivery', 'fifteen_days_post_delivery', 'thirty_days_post_delivery')`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" TYPE "public"."buy_requests_preferredpaymentmethod_enum" USING "preferredPaymentMethod"::"text"::"public"."buy_requests_preferredpaymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" SET DEFAULT 'pay_on_delivery'`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_preferredpaymentmethod_enum_old"`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_d6bbb35c3b888c9cd97bb05f4c5" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_d6bbb35c3b888c9cd97bb05f4c5"`);
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_preferredpaymentmethod_enum_old" AS ENUM('pay_on_delivery')`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" TYPE "public"."buy_requests_preferredpaymentmethod_enum_old" USING "preferredPaymentMethod"::"text"::"public"."buy_requests_preferredpaymentmethod_enum_old"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ALTER COLUMN "preferredPaymentMethod" SET DEFAULT 'pay_on_delivery'`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_preferredpaymentmethod_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."buy_requests_preferredpaymentmethod_enum_old" RENAME TO "buy_requests_preferredpaymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "cropId"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "isHarvestEvent"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "cropQuantityUnit"`);
        await queryRunner.query(`DROP TYPE "public"."crop_quantity_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "cropQuantity"`);
    }

}
