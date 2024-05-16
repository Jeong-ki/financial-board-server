import {
  Inject,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  SignUpResult,
  SignUpInput,
  User,
  UserFilter,
  UpdateUserInput,
  UpdateUserBySelfInput,
} from './user.dto';
import { UserService } from './user.service';
import { JwtValidationGuard } from 'src/auth/jwt.validation.guard';

@Resolver()
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);
  constructor(private userService: UserService) {}

  @Mutation(() => SignUpResult, { nullable: false, name: 'SignupUser' })
  async signUpUser(
    @Args('data', { type: () => SignUpInput }) data: SignUpInput,
  ) {
    try {
      const signUpResult = await this.userService.signUp(data);
      return signUpResult;
    } catch (e) {
      this.logger.error(`id: ${data}`, (e as Error).stack);
      throw new InternalServerErrorException('Error on creating user.');
    }
  }

  @UseGuards(JwtValidationGuard)
  @Query(() => [User], {
    nullable: false,
    name: 'FindUsers',
  })
  async findUsers(
    @Args('filter', { type: () => UserFilter }) filter: UserFilter,
  ) {
    try {
      const users = await this.userService.findUsers(filter);

      return users;
    } catch (e) {
      this.logger.error(
        `filter: ${JSON.stringify(filter)}`,
        (e as Error).stack,
      );
      if (e instanceof UnauthorizedException) {
        throw e as UnauthorizedException;
      } else {
        throw new InternalServerErrorException(
          'Error on finding users.',
          (e as Error).message,
        );
      }
    }
  }

  @UseGuards(JwtValidationGuard)
  @Mutation(() => User, {
    nullable: false,
    name: 'UpdateUser',
  })
  async updateUser(
    @Args('data', { type: () => UpdateUserInput }) data: UpdateUserInput,
  ) {
    try {
      const targetUser = await this.userService.findOneUserById(data.id);
      if (!targetUser) throw new Error(`Not found user. (id: ${data.id})`);

      data.id = targetUser.id;
      const updatedUser = await this.userService.updateUser(data);

      return updatedUser;
    } catch (e) {
      this.logger.error(`data: ${JSON.stringify(data)}`, (e as Error).stack);
      if (e instanceof UnauthorizedException) {
        throw e as UnauthorizedException;
      } else {
        throw new InternalServerErrorException(
          'Error on update user.',
          (e as Error).message,
        );
      }
    }
  }

  @UseGuards(JwtValidationGuard)
  @Mutation(() => User, {
    nullable: false,
    name: 'UpdateUserBySelf',
  })
  async updateUserBySelf(
    @Args('data', { type: () => UpdateUserBySelfInput })
    updateUserBySelfInput: UpdateUserBySelfInput,
  ) {
    try {
      const updateUserInput: UpdateUserInput = {
        id: updateUserBySelfInput.id,
        name: updateUserBySelfInput.name,
      };
      const updatedUser = await this.userService.updateUser(updateUserInput);

      return updatedUser;
    } catch (e) {
      this.logger.error(
        `id: ${JSON.stringify(updateUserBySelfInput)}`,
        (e as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error on updating user by self.',
        (e as Error).message,
      );
    }
  }
}
