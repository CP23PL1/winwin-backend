import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDriverTable1701228939362 implements MigrationInterface {
    name = 'CreateDriverTable1701228939362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."EDriverRole_1" AS ENUM('owner', 'member')`);
        await queryRunner.query(`CREATE TABLE "driver" ("uid" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "approved" boolean NOT NULL DEFAULT false, "role" "public"."EDriverRole_1" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceSpotId" integer, CONSTRAINT "PK_f002c7cf7112f2c514867dda26f" PRIMARY KEY ("uid"))`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`DROP TABLE "driver"`);
        await queryRunner.query(`DROP TYPE "public"."EDriverRole_1"`);
    }

}
