import { MigrationInterface, QueryRunner } from "typeorm";

export class OverhulDriverEntityAndRelation1710431063621 implements MigrationInterface {
    name = 'OverhulDriverEntityAndRelation1710431063621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_54b6d3ee422423b47b236e7b400"`);
        await queryRunner.query(`CREATE TABLE "driver" ("id" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceSpotId" integer, CONSTRAINT "UQ_f248be80b08997f667b0404c910" UNIQUE ("phoneNumber"), CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_359c9d0b559243519d9b84e39a" ON "driver" ("serviceSpotId") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_54b6d3ee422423b47b236e7b40"`);
        await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "driverId"`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD "driverId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_54b6d3ee422423b47b236e7b40" ON "drive_request" ("driverId") `);
        await queryRunner.query(`CREATE INDEX "IDX_05b4bd09b8a0d5bf669c644d12" ON "service_spot" ("serviceSpotOwnerId") `);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_54b6d3ee422423b47b236e7b400" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f" FOREIGN KEY ("serviceSpotOwnerId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f"`);
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_54b6d3ee422423b47b236e7b400"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05b4bd09b8a0d5bf669c644d12"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54b6d3ee422423b47b236e7b40"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f" UNIQUE ("serviceSpotOwnerId")`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "driverId"`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD "driverId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_54b6d3ee422423b47b236e7b40" ON "drive_request" ("driverId") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_359c9d0b559243519d9b84e39a"`);
        await queryRunner.query(`DROP TABLE "driver"`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_54b6d3ee422423b47b236e7b400" FOREIGN KEY ("driverId") REFERENCES "driver_has_service_spot"("driverId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
