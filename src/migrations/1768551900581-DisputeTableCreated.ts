import { MigrationInterface, QueryRunner } from "typeorm";

export class DisputeTableCreated1768551900581 implements MigrationInterface {
    name = 'DisputeTableCreated1768551900581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."disputes_initiatortype_enum" AS ENUM('buyer', 'seller')`);
        await queryRunner.query(`CREATE TYPE "public"."disputes_status_enum" AS ENUM('open', 'under_review', 'resolved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "disputes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "initiatorType" "public"."disputes_initiatortype_enum" NOT NULL, "reason" text NOT NULL, "status" "public"."disputes_status_enum" NOT NULL DEFAULT 'open', "resolvedBy" text, "resolvedAt" TIMESTAMP WITH TIME ZONE, "rejectedBy" text, "rejectedAt" TIMESTAMP WITH TIME ZONE, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "buyRequestId" uuid, "initiatedById" uuid, CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_17dfc0433d332b5f6777a57618" ON "disputes" ("initiatedById") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ea46f4f2225f38d127063c367" ON "disputes" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_283f3ae97432623646f4008dfa" ON "disputes" ("buyRequestId") `);
        await queryRunner.query(`ALTER TABLE "buy_requests" ADD "completedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_audience_enum" AS ENUM('user', 'admins', 'system')`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "audience" "public"."notifications_audience_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('buy_request', 'order_status', 'contact_message', 'dispute', 'system')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_relatedentitytype_enum" RENAME TO "notifications_relatedentitytype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_relatedentitytype_enum" AS ENUM('buy_request', 'product', 'dispute', 'event')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "relatedEntityType" TYPE "public"."notifications_relatedentitytype_enum" USING "relatedEntityType"::"text"::"public"."notifications_relatedentitytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_relatedentitytype_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_b73fd7027ccee0a8e006efc5af" ON "notifications" ("audience", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "disputes" ADD CONSTRAINT "FK_283f3ae97432623646f4008dfa4" FOREIGN KEY ("buyRequestId") REFERENCES "buy_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD CONSTRAINT "FK_17dfc0433d332b5f6777a576186" FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT "FK_17dfc0433d332b5f6777a576186"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT "FK_283f3ae97432623646f4008dfa4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b73fd7027ccee0a8e006efc5af"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_relatedentitytype_enum_old" AS ENUM('buy_request', 'product')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "relatedEntityType" TYPE "public"."notifications_relatedentitytype_enum_old" USING "relatedEntityType"::"text"::"public"."notifications_relatedentitytype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_relatedentitytype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_relatedentitytype_enum_old" RENAME TO "notifications_relatedentitytype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('buy_request', 'order_status', 'contact_message')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "audience"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_audience_enum"`);
        await queryRunner.query(`ALTER TABLE "buy_requests" DROP COLUMN "completedAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_283f3ae97432623646f4008dfa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ea46f4f2225f38d127063c367"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17dfc0433d332b5f6777a57618"`);
        await queryRunner.query(`DROP TABLE "disputes"`);
        await queryRunner.query(`DROP TYPE "public"."disputes_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."disputes_initiatortype_enum"`);
    }

}
