import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env.local`,
      ],
      validationSchema: Joi.object({
        VEHICLE_STATUS_DBMS_TYPE: Joi.string().required(),
        VEHICLE_STATUS_DBMS_HOST: Joi.string().required(),
        VEHICLE_STATUS_DBMS_PORT: Joi.string().required(),
        VEHICLE_STATUS_DBMS_USERNAME: Joi.string().required(),
        VEHICLE_STATUS_DBMS_PASSWORD: Joi.string().required(),
        VEHICLE_STATUS_DBMS_DATABASE: Joi.string().required(),
      }),
    }),
  ],
})
export class fincialBoardModule {}
