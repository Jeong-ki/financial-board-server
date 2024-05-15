import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

export type AuthStrategyProps = {
  secretKey: string;
};

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  static PROPS_PROPERTY = `${AuthStrategy.name}).PROPS`;
  private readonly logger: Logger = new Logger(AuthStrategy.name);
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    @Inject(AuthStrategy.PROPS_PROPERTY) props: AuthStrategyProps,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: props.secretKey,
    });
  }

  async validate(req: Request, payload: any) {
    let token = '';
    try {
      token = this.authService.getTokenFromReqHeader(req);
      return await this.authService.validateToken(token, payload);
    } catch (e) {
      this.logger.error(
        `Token is invalid. (Token: ${token}, payload:${JSON.stringify(
          payload,
        )})`,
        (e as Error).stack,
      );
      throw new UnauthorizedException('Token is invalid.');
    }
  }
}
