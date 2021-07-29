import { HttpException, HttpStatus } from "@nestjs/common";

export class RequestFailedException extends HttpException {
  requestResponse: unknown;

  constructor(response: unknown = "") {
    super(
      `Failed to request to the remote: ${response}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    this.requestResponse = response;
  }
}
