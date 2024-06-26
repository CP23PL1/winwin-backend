import { MigrationInterface, QueryRunner } from 'typeorm';

export class DriverServiceSpotNullable1711977683487 implements MigrationInterface {
  name = 'DriverServiceSpotNullable1711977683487';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
