import {
  ExecutionContext,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Context,
  GraphQLExecutionContext,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { User } from '../user/user.dto';
import { UserService } from '../user/user.service';

import { AuthService } from './auth.service';
import {
  LogInInput,
  SessionUpdateOutput,
  SessionUpdateReasonEnum,
  UserSessionInfo,
} from './auth.dto';
import { JwtValidationGuard } from './jwt.validation.guard';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Mutation(() => UserSessionInfo, { nullable: false, name: 'LogIn' })
  async logIn(
    @Context() context: ExecutionContext,
    @Args() loginInput: LogInInput,
  ): Promise<UserSessionInfo> {
    let req;
    let headers;
    try {
      req = context['req'];
      headers = req?.headers;

      if (!headers) {
        console.log('test');
        throw new InternalServerErrorException(
          'Request header and socket is null.',
        );
      }

      const user: User = await this.userService.findOneUserByUserId(
        loginInput.userId,
      );

      if (!user) {
        throw new UnauthorizedException(
          `User(userId: ${loginInput.userId}) does not exists.`,
        );
      } else if (!user.isActivated) {
        throw new UnauthorizedException(
          `User(userId: ${loginInput.userId}) is not activated.`,
        );
      } else {
        const isValidPassword = await this.authService.checkUserPassword(
          user,
          loginInput.password,
        );
        if (isValidPassword) {
          return await this.authService.createUserSession(user);
        } else {
          throw new UnauthorizedException(
            `User(userId: ${loginInput.userId}, password: ${loginInput.password}) does not exists.`,
          );
        }
      }
    } catch (e) {
      this.logger.error(
        `Headers: ${JSON.stringify(headers)}, LoginInput: ${JSON.stringify(
          loginInput,
        )}`,
        (e as Error).stack,
      );
      if (e instanceof UnauthorizedException) {
        throw e;
      } else {
        throw new InternalServerErrorException((e as Error).message);
      }
    }
  }

  @UseGuards(JwtValidationGuard)
  @Mutation(() => SessionUpdateOutput, {
    nullable: false,
    name: 'RefreshSessionExpiration',
  })
  async refreshSessionExpiration(
    @Context() context: ExecutionContext,
  ): Promise<SessionUpdateOutput> {
    let req;
    let headers;
    try {
      req = context['req'];
      headers = req?.headers;

      if (!headers) {
        throw new InternalServerErrorException(
          'Request header and socket is null.',
        );
      }

      const user = req['user'];
      const userSessionInfo: UserSessionInfo =
        await this.authService.refreshSessionExpiration(user);
      const sessionRefreshOutput: SessionUpdateOutput = {
        userSessionInfo: userSessionInfo,
        sessionUpdateReasonEnum:
          SessionUpdateReasonEnum.REFRESH_SESSION_EXPIRATION_DATE,
      };
      return sessionRefreshOutput;
    } catch (e) {
      // this.logger.error(
      //   `Headers: ${JSON.stringify(headers)}, LoginInput: ${JSON.stringify(loginInput)}`,
      //   (e as Error).stack
      // );
      throw new InternalServerErrorException('Error on logging in.');
    }
  }

  @UseGuards(JwtValidationGuard)
  @Query(() => UserSessionInfo, { nullable: true, name: 'FindUserSessionInfo' })
  async findUserSessionInfo(
    @Context() context: GraphQLExecutionContext,
  ): Promise<UserSessionInfo> {
    try {
      const user: User = context['req']['user'];
      if (user && user.id) {
        const userSessionInfo: UserSessionInfo =
          await this.authService.findUserSessionInfo(user.userId);
        return userSessionInfo;
      } else {
        throw new Error('Context.req has no user');
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Error on finding user session info',
      );
    }
  }
}
