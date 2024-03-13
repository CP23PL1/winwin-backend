import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserId1710093419068 implements MigrationInterface {
  name = 'ChangeUserId1710093419068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drive_request" DROP CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_55f0c0f143eeef41feed28e7a6"`);
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "userId" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `CREATE INDEX "IDX_55f0c0f143eeef41feed28e7a6" ON "drive_request" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_request" ADD CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drive_request" DROP CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_55f0c0f143eeef41feed28e7a6"`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "userId" integer NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_55f0c0f143eeef41feed28e7a6" ON "drive_request" ("userId") `,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_request" ADD CONSTRAINT "FK_55f0c0f143eeef41feed28e7a66" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
