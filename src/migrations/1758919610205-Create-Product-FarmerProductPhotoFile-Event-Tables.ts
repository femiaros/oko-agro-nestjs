import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductFarmerProductPhotoFileEventTables1758919610205 implements MigrationInterface {
    name = 'CreateProductFarmerProductPhotoFileEventTables1758919610205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "farmer_product_photo_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "publicId" character varying NOT NULL, "description" character varying NOT NULL, "mimeType" character varying, "size" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_8a9978b2c60fb313dd116a5d949" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_referencetype_enum" AS ENUM('product', 'custom')`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('upcoming', 'today', 'concluded')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "referenceId" uuid, "referenceType" "public"."events_referencetype_enum", "eventDate" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'upcoming', "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid, "productId" uuid, CONSTRAINT "REL_355396274b2fbf7db953b9fedf" UNIQUE ("productId"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_quantityunit_enum" AS ENUM('kilogram', 'tonne')`);
        await queryRunner.query(`CREATE TYPE "public"."products_pricecurrency_enum" AS ENUM('ngn')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "quantity" character varying NOT NULL, "quantityUnit" "public"."products_quantityunit_enum" NOT NULL, "pricePerUnit" character varying NOT NULL, "priceCurrency" "public"."products_pricecurrency_enum" NOT NULL DEFAULT 'ngn', "locationAddress" character varying, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cropTypeId" uuid, "ownerId" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crops" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "crops" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "farmer_product_photo_files" ADD CONSTRAINT "FK_d7ae89a079bd687a26f71c14d1c" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_72bbe49600962f125177d7d6b68" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_355396274b2fbf7db953b9fedfa" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_3cef2468bedd7b37ab7f8c821da" FOREIGN KEY ("cropTypeId") REFERENCES "crops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_663aa9983fd61dfc310d407d4da" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_663aa9983fd61dfc310d407d4da"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_3cef2468bedd7b37ab7f8c821da"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_355396274b2fbf7db953b9fedfa"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_72bbe49600962f125177d7d6b68"`);
        await queryRunner.query(`ALTER TABLE "farmer_product_photo_files" DROP CONSTRAINT "FK_d7ae89a079bd687a26f71c14d1c"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "createdAt"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_pricecurrency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_quantityunit_enum"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_referencetype_enum"`);
        await queryRunner.query(`DROP TABLE "farmer_product_photo_files"`);
    }

}
