import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBuyRequestsTable1759189094755 implements MigrationInterface {
    name = 'CreateBuyRequestsTable1759189094755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_productquantityunit_enum" AS ENUM('kilogram', 'tonne')`);
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_preferredpaymentmethod_enum" AS ENUM('pay_on_delivery')`);
        await queryRunner.query(`CREATE TYPE "public"."buy_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "buy_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requestNumber" bigint NOT NULL, "description" character varying NOT NULL, "productQuantity" character varying NOT NULL, "productQuantityUnit" "public"."buy_requests_productquantityunit_enum" NOT NULL, "pricePerUnitOffer" character varying NOT NULL, "estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE NOT NULL, "deliveryLocation" character varying NOT NULL, "preferredPaymentMethod" "public"."buy_requests_preferredpaymentmethod_enum" NOT NULL DEFAULT 'pay_on_delivery', "status" "public"."buy_requests_status_enum" NOT NULL DEFAULT 'pending', "isGeneral" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cropTypeId" uuid, "qualityStandardTypeId" uuid, "buyerId" uuid, "sellerId" uuid, "productId" uuid, CONSTRAINT "UQ_4625c99de2e8489e727f6253181" UNIQUE ("requestNumber"), CONSTRAINT "PK_5a91945843a2916ab3a8ed4854a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD CONSTRAINT "FK_3209e88dbcd92054cd9733f19ad" FOREIGN KEY ("cropTypeId") REFERENCES "crops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD CONSTRAINT "FK_0f16dab60cb308d10d39719fdf1" FOREIGN KEY ("qualityStandardTypeId") REFERENCES "quality_standards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD CONSTRAINT "FK_b34ab9b15f8ca8d77714225c655" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD CONSTRAINT "FK_b796faf80f1e53590bef5ca9137" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD CONSTRAINT "FK_50344a787aad7c11c32b9dff917" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP CONSTRAINT "FK_50344a787aad7c11c32b9dff917"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP CONSTRAINT "FK_b796faf80f1e53590bef5ca9137"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP CONSTRAINT "FK_b34ab9b15f8ca8d77714225c655"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP CONSTRAINT "FK_0f16dab60cb308d10d39719fdf1"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP CONSTRAINT "FK_3209e88dbcd92054cd9733f19ad"`);
        await queryRunner.query(`DROP TABLE "buy_requests"`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_preferredpaymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."buy_requests_productquantityunit_enum"`);
    }

}
