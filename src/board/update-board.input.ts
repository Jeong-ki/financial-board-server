import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateBoardInput } from './create-board.input';

@InputType()
export class UpdateBoardInput extends PartialType(CreateBoardInput) {
  @Field(() => Int)
  id: number;
}
