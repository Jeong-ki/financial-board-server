import * as path from 'path';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({
  path: path.resolve(process.cwd(), '.env'),
});

const {
  FINCIAL_BOARD_DBMS_HOST,
  FINCIAL_BOARD_DBMS_PORT,
  FINCIAL_BOARD_DBMS_USERNAME,
  FINCIAL_BOARD_DBMS_PASSWORD,
  FINCIAL_BOARD_DBMS_DATABASE,
} = process.env;

const dataSource = new DataSource({
  name: 'default',
  type: 'postgres',
  host: FINCIAL_BOARD_DBMS_HOST,
  port: parseInt(FINCIAL_BOARD_DBMS_PORT),
  username: FINCIAL_BOARD_DBMS_USERNAME,
  password: FINCIAL_BOARD_DBMS_PASSWORD,
  database: FINCIAL_BOARD_DBMS_DATABASE,
  schema: 'public',
  synchronize: false,
  logging: false,
  entities: ['./src/db/entities/*.entity.{js,ts}'],
  migrations: ['./migrations/*.{js,ts}'],
});

export default dataSource;
