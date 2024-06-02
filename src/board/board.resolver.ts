import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './board.entity';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Mutation(() => String)
  createBoard(@Args('createBoardInput') createBoardInput) {
    return this.boardService.create(createBoardInput);
  }

  //   @Query(() => [Board], { name: 'board' })
  //   findAll() {
  //     return this.boardService.findAll();
  //   }

  //   @Query(() => Board, { name: 'board' })
  //   findOne(@Args('id', { type: () => Int }) id: number) {
  //     return this.boardService.findOne(id);
  //   }

  //   @Mutation(() => Board)
  //   updateBoard(@Args('updateBoardInput') updateBoardInput) {
  //     return this.boardService.update(updateBoardInput.id, updateBoardInput);
  //   }

  //   @Mutation(() => Board)
  //   removeBoard(@Args('id', { type: () => Int }) id: number) {
  //     return this.boardService.remove(id);
  //   }
}
