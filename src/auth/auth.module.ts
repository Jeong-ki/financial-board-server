import { Module } from '@nestjs/common';
import { AuthService, AuthServiceProps } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthStrategy, AuthStrategyProps } from './auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [process.env.NODE_ENV ? `.env` : '.env'],
      validationSchema: Joi.object({
        AUTH_JWT_SECRET: Joi.string().required(),
        AUTH_SESSION_KEY_PREFIX: Joi.string().required(),
        AUTH_SESSION_EXPIRED_IN_MINUTE: Joi.number().integer().required(),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>('AUTH_SESSION_EXPIRED_IN_MINUTE'),
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    {
      provide: AuthService.PROPS_PROPERTY,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const authServiceProps: AuthServiceProps = {
          sessionExpiredInMinute: Number.parseInt(
            configService.get('AUTH_SESSION_EXPIRED_IN_MINUTE'),
          ),
          sessionKeyPrefix: configService.get('AUTH_SESSION_KEY_PREFIX'),
        };
        return authServiceProps;
      },
    },
    {
      provide: AuthStrategy.PROPS_PROPERTY,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const authStrategyProps: AuthStrategyProps = {
          secretKey: configService.get(`AUTH_JWT_SECRET`),
        };
        return authStrategyProps;
      },
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
