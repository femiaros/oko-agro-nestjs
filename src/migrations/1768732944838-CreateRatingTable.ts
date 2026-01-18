import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRatingTable1768732944838 implements MigrationInterface {
    name = 'CreateRatingTable1768732944838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ratings_raterrole_enum" AS ENUM('buyer', 'seller')`);
        await queryRunner.query(`CREATE TYPE "public"."ratings_rateerole_enum" AS ENUM('buyer', 'seller')`);
        await queryRunner.query(`CREATE TABLE "ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "raterRole" "public"."ratings_raterrole_enum" NOT NULL, "rateeRole" "public"."ratings_rateerole_enum" NOT NULL, "score" integer NOT NULL, "comment" text, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "buyRequestId" uuid, "raterId" uuid, "rateeId" uuid, CONSTRAINT "uq_rating_per_buyrequest_per_rater" UNIQUE ("buyRequestId", "raterId"), CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dc83bc48cfaaa56920a68da24f" ON "ratings" ("rateeId") `);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('buy_request', 'order_status', 'contact_message', 'dispute', 'system', 'rating')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_bfb728df3684c90d61c5f597a2c" FOREIGN KEY ("buyRequestId") REFERENCES "buy_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_e5d0a61e726410a860f23f39de7" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_dc83bc48cfaaa56920a68da24ff" FOREIGN KEY ("rateeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_dc83bc48cfaaa56920a68da24ff"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_e5d0a61e726410a860f23f39de7"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_bfb728df3684c90d61c5f597a2c"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('buy_request', 'order_status', 'contact_message', 'dispute', 'system')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc83bc48cfaaa56920a68da24f"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP TYPE "public"."ratings_rateerole_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ratings_raterrole_enum"`);
    }

}
