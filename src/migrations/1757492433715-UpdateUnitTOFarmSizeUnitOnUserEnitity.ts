import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUnitTOFarmSizeUnitOnUserEnitity1757492433715 implements MigrationInterface {
    name = 'UpdateUnitTOFarmSizeUnitOnUserEnitity1757492433715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "unit" TO "farmSizeUnit"`);
        await queryRunner.query(`ALTER TYPE "public"."users_unit_enum" RENAME TO "users_farmsizeunit_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_farmsizeunit_enum" RENAME TO "users_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "farmSizeUnit" TO "unit"`);
    }

}
