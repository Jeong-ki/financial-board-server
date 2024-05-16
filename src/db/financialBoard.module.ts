import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

export const FINCIAL_BOARD_DB_CONN_NAME = 'FINCIAL_BOARD_DB_CONN_NAME';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env.local`,
      ],
      validationSchema: Joi.object({
        FINCIAL_BOARD_DBMS_TYPE: Joi.string().required(),
        FINCIAL_BOARD_DBMS_HOST: Joi.string().required(),
        FINCIAL_BOARD_DBMS_PORT: Joi.string().required(),
        FINCIAL_BOARD_DBMS_USERNAME: Joi.string().required(),
        FINCIAL_BOARD_DBMS_PASSWORD: Joi.string().required(),
        FINCIAL_BOARD_DBMS_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mariadb',
          host: configService.get(`FINCIAL_BOARD_DBMS_HOST`),
          port: Number.parseInt(configService.get(`FINCIAL_BOARD_DBMS_PORT`)),
          username: configService.get(`FINCIAL_BOARD_DBMS_USERNAME`),
          password: configService.get(`FINCIAL_BOARD_DBMS_PASSWORD`),
          database: configService.get(`FINCIAL_BOARD_DBMS_DATABASE`),
          entities: [], //TODO ADD Entity
          synchronize: false,
          logging: ['error'],
          // logging: true,
        };
      },
      name: FINCIAL_BOARD_DB_CONN_NAME,
    }),
  ],
})
export class fincialBoardModule {}
