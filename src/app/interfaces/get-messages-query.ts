import { IsBoolean } from "class-validator";

export class GetMessagesQuery {
  @IsBoolean()
  approved!: boolean;

  @IsBoolean()
  published!: boolean;
}
