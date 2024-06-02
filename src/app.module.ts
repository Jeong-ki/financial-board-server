import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InMemoryDBModule } from './redis/redis-db.module';
import { GraphqlModule } from './graphql/graphql.module';
import { fincialBoardModule } from './db/financialBoard.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    InMemoryDBModule,
    GraphqlModule,
    fincialBoardModule,
    UserModule,
    AuthModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
