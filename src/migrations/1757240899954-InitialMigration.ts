import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757240899954 implements MigrationInterface {
    name = 'InitialMigration1757240899954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "size" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "size" integer NOT NULL`);
    }

}
