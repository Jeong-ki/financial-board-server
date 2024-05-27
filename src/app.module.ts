import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InMemoryDBModule } from './redis/redis-db.module';
import { GraphqlModule } from './graphql/graphql.module';
import { fincialBoardModule } from './db/financialBoard.module';

@Module({
  imports: [InMemoryDBModule, GraphqlModule, fincialBoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
