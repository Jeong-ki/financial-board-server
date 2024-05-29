import { MigrationInterface, QueryRunner } from "typeorm";

export class First1716989116932 implements MigrationInterface {
    name = 'First1716989116932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "board" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userid" character varying(50) NOT NULL, "salt" character varying(200) NOT NULL, "name" character varying(50) NOT NULL DEFAULT '', "hash" character varying(200) NOT NULL, "is_admin" boolean NOT NULL DEFAULT false, "is_activated" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_755ac9fbd440bc9b97fe9532108" UNIQUE ("userid"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "board"`);
    }

}
