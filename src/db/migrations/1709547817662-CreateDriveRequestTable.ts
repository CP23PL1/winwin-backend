import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDriveRequestTable1709547817662 implements MigrationInterface {
    name = 'CreateDriveRequestTable1709547817662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "driver_has_service_spot" ("driverId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceSpotId" integer, CONSTRAINT "PK_2ab1700fe913ca0c2a9544d84d7" PRIMARY KEY ("driverId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b275312e10ea604597ea9d852" ON "driver_has_service_spot" ("serviceSpotId") `);
        await queryRunner.query(`CREATE TYPE "public"."drive_request_status" AS ENUM('pending', 'accepted', 'picked_up', 'rejected', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "drive_request" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "driverId" integer NOT NULL, "origin" jsonb NOT NULL, "destination" jsonb NOT NULL, "status" "public"."drive_request_status" NOT NULL, "refCode" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07ab586b9fb2a58f8ebd9f817d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55f0c0f143eeef41feed28e7a6" ON "drive_request" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_54b6d3ee422423b47b236e7b40" ON "drive_request" ("driverId") `);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "FK_5de6541077900c7155b8254cfdd"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "subDistrictId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_8559f83d04890fc46edd3685ed2"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f" UNIQUE ("serviceSpotOwnerId")`);
        await queryRunner.query(`ALTER TABLE "driver_has_service_spot" ADD CONSTRAINT "FK_8b275312e10ea604597ea9d8528" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_54b6d3ee422423b47b236e7b400" FOREIGN KEY ("driverId") REFERENCES "driver_has_service_spot"("driverId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "FK_5de6541077900c7155b8254cfdd" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "FK_5de6541077900c7155b8254cfdd"`);
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_54b6d3ee422423b47b236e7b400"`);
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66"`);
        await queryRunner.query(`ALTER TABLE "driver_has_service_spot" DROP CONSTRAINT "FK_8b275312e10ea604597ea9d8528"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f"`);
        await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_8559f83d04890fc46edd3685ed2" UNIQUE ("serviceSpotOwnerId")`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "subDistrictId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ADD CONSTRAINT "FK_5de6541077900c7155b8254cfdd" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54b6d3ee422423b47b236e7b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55f0c0f143eeef41feed28e7a6"`);
        await queryRunner.query(`DROP TABLE "drive_request"`);
        await queryRunner.query(`DROP TYPE "public"."drive_request_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b275312e10ea604597ea9d852"`);
        await queryRunner.query(`DROP TABLE "driver_has_service_spot"`);
    }

}
