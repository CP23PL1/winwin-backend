import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDriverRole1702294177597 implements MigrationInterface {
  name = 'RemoveDriverRole1702294177597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."EDriverRole_1"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`CREATE TYPE "public"."EDriverRole_1" AS ENUM('owner', 'member')`);
    await queryRunner.query(`ALTER TABLE "driver" ADD "role" "public"."EDriverRole_1" NOT NULL`);
  }
}
