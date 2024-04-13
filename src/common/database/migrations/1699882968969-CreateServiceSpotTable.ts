import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceSpotTable1699882968969 implements MigrationInterface {
  name = 'CreateServiceSpotTable1699882968969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_spot" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "coords" geometry NOT NULL, "placeId" character varying NOT NULL, "approved" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_95e77756c12e217f31d4a30375e" UNIQUE ("name"), CONSTRAINT "UQ_17f7d7199780065e94630b86c0e" UNIQUE ("placeId"), CONSTRAINT "PK_b3e44186b1609ecd7e4ccf8a641" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2013dbb205f1589470cc7adf97" ON "service_spot" USING GiST ("coords") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2013dbb205f1589470cc7adf97"`);
    await queryRunner.query(`DROP TABLE "service_spot"`);
  }
}
