import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserMapper } from './user.mapper';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from 'src/db/entities/user.entity';
import { FINCIAL_BOARD_DB_CONN_NAME } from 'src/db/financialBoard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity], FINCIAL_BOARD_DB_CONN_NAME),
    forwardRef(() => AuthModule),
  ],
  providers: [UserResolver, UserService, UserMapper],
  exports: [UserService, UserMapper],
})
export class UserModule {}
