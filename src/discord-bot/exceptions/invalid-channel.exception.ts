import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidChannelException extends HttpException {
  constructor() {
    super(
      `Discord: The channel which the message should send to is invalid.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
