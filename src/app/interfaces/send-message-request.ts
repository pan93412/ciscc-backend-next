import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class SendMessageRequest {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  message!: string;
}
