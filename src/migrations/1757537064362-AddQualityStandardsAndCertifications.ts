import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQualityStandardsAndCertifications1757537064362 implements MigrationInterface {
    name = 'AddQualityStandardsAndCertifications1757537064362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "certifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_9eb29158fdc27b227a71c7f138c" UNIQUE ("name"), CONSTRAINT "PK_fd763d412e4a1fb1b6dadd6e72b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quality_standards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_74cfbe051fbf6800d3f72cf6a5a" UNIQUE ("name"), CONSTRAINT "PK_aeac940be3b7656800253a57e5a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_certifications" ("userId" uuid NOT NULL, "certificationId" uuid NOT NULL, CONSTRAINT "PK_f0e89ae7a987dd0bb66254528d5" PRIMARY KEY ("userId", "certificationId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_404d2600e3ff3739cc63feac3c" ON "user_certifications" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_61407e2dc4b10aa6577e89b473" ON "user_certifications" ("certificationId") `);
        await queryRunner.query(`CREATE TABLE "user_qualityStandards" ("userId" uuid NOT NULL, "qualityStandardId" uuid NOT NULL, CONSTRAINT "PK_54b40dfa1491e8a965c30a87fb0" PRIMARY KEY ("userId", "qualityStandardId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dcff79f8c120e7fc6356702475" ON "user_qualityStandards" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c09fdd3f5fcd395c73b291a87e" ON "user_qualityStandards" ("qualityStandardId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "companyName" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessRegNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "yearEstablished" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."users_businesstype_enum" AS ENUM('food processing', 'oil mill', 'floor mill', 'rice mill', 'cassava processing', 'fruit processing')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessType" "public"."users_businesstype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "processsingCapacitySize" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."users_processsingcapacityunit_enum" AS ENUM('tons')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "processsingCapacityUnit" "public"."users_processsingcapacityunit_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_operatingdaysperweek_enum" AS ENUM('7days', '6days', '5days', 'seasonal operation')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "operatingDaysPerWeek" "public"."users_operatingdaysperweek_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "storageCapacity" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "minimumOrderQuality" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "OperationsType" character varying`);
        await queryRunner.query(`ALTER TABLE "user_certifications" ADD CONSTRAINT "FK_404d2600e3ff3739cc63feac3cc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_certifications" ADD CONSTRAINT "FK_61407e2dc4b10aa6577e89b4738" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_qualityStandards" ADD CONSTRAINT "FK_dcff79f8c120e7fc6356702475c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_qualityStandards" ADD CONSTRAINT "FK_c09fdd3f5fcd395c73b291a87ed" FOREIGN KEY ("qualityStandardId") REFERENCES "quality_standards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_qualityStandards" DROP CONSTRAINT "FK_c09fdd3f5fcd395c73b291a87ed"`);
        await queryRunner.query(`ALTER TABLE "user_qualityStandards" DROP CONSTRAINT "FK_dcff79f8c120e7fc6356702475c"`);
        await queryRunner.query(`ALTER TABLE "user_certifications" DROP CONSTRAINT "FK_61407e2dc4b10aa6577e89b4738"`);
        await queryRunner.query(`ALTER TABLE "user_certifications" DROP CONSTRAINT "FK_404d2600e3ff3739cc63feac3cc"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "OperationsType"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "minimumOrderQuality"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "storageCapacity"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "operatingDaysPerWeek"`);
        await queryRunner.query(`DROP TYPE "public"."users_operatingdaysperweek_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "processsingCapacityUnit"`);
        await queryRunner.query(`DROP TYPE "public"."users_processsingcapacityunit_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "processsingCapacitySize"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessType"`);
        await queryRunner.query(`DROP TYPE "public"."users_businesstype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yearEstablished"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessRegNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "companyName"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c09fdd3f5fcd395c73b291a87e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dcff79f8c120e7fc6356702475"`);
        await queryRunner.query(`DROP TABLE "user_qualityStandards"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61407e2dc4b10aa6577e89b473"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_404d2600e3ff3739cc63feac3c"`);
        await queryRunner.query(`DROP TABLE "user_certifications"`);
        await queryRunner.query(`DROP TABLE "quality_standards"`);
        await queryRunner.query(`DROP TABLE "certifications"`);
    }

}
