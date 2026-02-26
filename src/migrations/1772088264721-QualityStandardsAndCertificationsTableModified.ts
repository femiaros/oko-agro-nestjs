import { MigrationInterface, QueryRunner } from "typeorm";

export class QualityStandardsAndCertificationsTableModified1772088264721 implements MigrationInterface {
    name = 'QualityStandardsAndCertificationsTableModified1772088264721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certifications" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "certifications" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quality_standards" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quality_standards" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quality_standards" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "quality_standards" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "certifications" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "certifications" DROP COLUMN "createdAt"`);
    }

}
