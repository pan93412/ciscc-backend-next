import { HttpException, HttpStatus } from "@nestjs/common";

export class RequestFailedException extends HttpException {
  constructor() {
    super("Failed to request to the remote.", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
