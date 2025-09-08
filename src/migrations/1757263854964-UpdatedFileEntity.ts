import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedFileEntity1757263854964 implements MigrationInterface {
    name = 'UpdatedFileEntity1757263854964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "userVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "userVerificationOtp" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "userVerificationOtpExpiryTime" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userVerificationOtpExpiryTime"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userVerificationOtp"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userVerified"`);
    }

}
