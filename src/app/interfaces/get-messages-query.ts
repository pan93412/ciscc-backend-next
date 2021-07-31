import { IsBooleanString } from "class-validator";

export class GetMessagesQuery {
  @IsBooleanString()
  approved!: boolean;

  @IsBooleanString()
  published!: boolean;
}
