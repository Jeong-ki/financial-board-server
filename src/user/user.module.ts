import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserMapper } from './user.mapper';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature(), forwardRef(() => AuthModule)],
  providers: [UserResolver, UserService, UserMapper],
  exports: [UserService, UserMapper],
})
export class UserModule {}
