import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDriverTable1713260173981 implements MigrationInterface {
    name = 'UpdateDriverTable1713260173981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f"`);
        await queryRunner.query(`CREATE TYPE "public"."auditing_driver_role_enum" AS ENUM('member', 'owner')`);
        await queryRunner.query(`CREATE TABLE "auditing_driver" ("_seq" BIGSERIAL NOT NULL, "_action" character varying(20) NOT NULL, "_modifiedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" character varying, "phoneNumber" character varying, "role" "public"."auditing_driver_role_enum" DEFAULT 'member', "serviceSpotId" integer, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP, CONSTRAINT "PK_4044a3542356a28379ccc95e8f6" PRIMARY KEY ("_seq"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6ceec7c78c998f35caee4378cf" ON "auditing_driver" ("id") `);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
        await queryRunner.query(`CREATE TYPE "public"."driver_role_enum" AS ENUM('member', 'owner')`);
        await queryRunner.query(`ALTER TABLE "driver" ADD "role" "public"."driver_role_enum" NOT NULL DEFAULT 'member'`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`);
        await queryRunner.query(`ALTER TABLE "driver" ALTER COLUMN "serviceSpotId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`);
        await queryRunner.query(`ALTER TABLE "driver" ALTER COLUMN "serviceSpotId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."driver_role_enum"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f" UNIQUE ("serviceSpotOwnerId")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ceec7c78c998f35caee4378cf"`);
        await queryRunner.query(`DROP TABLE "auditing_driver"`);
        await queryRunner.query(`DROP TYPE "public"."auditing_driver_role_enum"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f" FOREIGN KEY ("serviceSpotOwnerId") REFERENCES "driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
