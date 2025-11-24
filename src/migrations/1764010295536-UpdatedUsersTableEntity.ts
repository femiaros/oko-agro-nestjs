import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUsersTableEntity1764010295536 implements MigrationInterface {
    name = 'UpdatedUsersTableEntity1764010295536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_doc_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "publicId" character varying NOT NULL, "description" character varying NOT NULL, "mimeType" character varying, "size" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb42f910e9e7f5ba26ba64c59f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "paymentAmount" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."products_approvalstatus_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "approvalStatus" "public"."products_approvalstatus_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE TYPE "public"."users_estimatedannualproductionunit_enum" AS ENUM('kilogram', 'tonne')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "estimatedAnnualProductionUnit" "public"."users_estimatedannualproductionunit_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isDisabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('farmer', 'processor', 'admin', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('farmer', 'processor', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDisabled"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "estimatedAnnualProductionUnit"`);
        await queryRunner.query(`DROP TYPE "public"."users_estimatedannualproductionunit_enum"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "approvalStatus"`);
        await queryRunner.query(`DROP TYPE "public"."products_approvalstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "paymentAmount"`);
        await queryRunner.query(`DROP TABLE "purchase_order_doc_files"`);
    }

}
