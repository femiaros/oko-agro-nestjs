import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1756924606911 implements MigrationInterface {
    name = 'InitialMigration1756924606911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "crops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_33e6399d4c7cedd12806d5d4dd7" UNIQUE ("name"), CONSTRAINT "PK_098dbeb7c803dc7c08a7f02b805" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "url" character varying NOT NULL, "publicId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_unit_enum" AS ENUM('hectare', 'acre')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('farmer', 'processor', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "farmAddress" character varying, "country" character varying, "state" character varying, "farmName" character varying, "farmSize" numeric, "unit" "public"."users_unit_enum", "estimatedAnnualProduction" character varying, "farmingExperience" character varying, "internetAccess" character varying, "howUserSellCrops" character varying, "bankName" character varying, "accountNumber" character varying, "role" "public"."users_role_enum" NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_crops" ("userId" uuid NOT NULL, "cropId" uuid NOT NULL, CONSTRAINT "PK_4907ab1e7faa6dd9daaed7894fb" PRIMARY KEY ("userId", "cropId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_764bc4a82f2cfd2f8ac1aeb63a" ON "user_crops" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_62f05dd8a673f7f24ff8c1279c" ON "user_crops" ("cropId") `);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_a23484d1055e34d75b25f616792" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_crops" ADD CONSTRAINT "FK_764bc4a82f2cfd2f8ac1aeb63a4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_crops" ADD CONSTRAINT "FK_62f05dd8a673f7f24ff8c1279c7" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_crops" DROP CONSTRAINT "FK_62f05dd8a673f7f24ff8c1279c7"`);
        await queryRunner.query(`ALTER TABLE "user_crops" DROP CONSTRAINT "FK_764bc4a82f2cfd2f8ac1aeb63a4"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a23484d1055e34d75b25f616792"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62f05dd8a673f7f24ff8c1279c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_764bc4a82f2cfd2f8ac1aeb63a"`);
        await queryRunner.query(`DROP TABLE "user_crops"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_unit_enum"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "crops"`);
    }

}
