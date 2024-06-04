import { forwardRef, Module } from '@nestjs/common';
import { AuthService, AuthServiceProps } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthStrategy, AuthStrategyProps } from './auth.strategy';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/user/user.module';
import { JwtValidationGuard } from './jwt.validation.guard';
import { PassportModule } from '@nestjs/passport';

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
    PassportModule.register({
      property: 'user',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const option = {
          secret: configService.get(`AUTH_JWT_SECRET`),
          signOptions: {
            expiresIn: `${configService.get(
              'AUTH_SESSION_EXPIRED_IN_MINUTE',
            )}m`,
          },
        };
        return option;
      },
    }),
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtValidationGuard,
    AuthStrategy,
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
  exports: [AuthService, JwtModule, JwtValidationGuard],
})
export class AuthModule {}
