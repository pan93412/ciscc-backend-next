import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageRequest {
  @IsNotEmpty()
  @IsString()
  message!: string;
}
