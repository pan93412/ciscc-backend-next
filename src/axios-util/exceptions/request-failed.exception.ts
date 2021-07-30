import { HttpException, HttpStatus } from "@nestjs/common";

export class RequestFailedException extends HttpException {
  requestResponse: unknown;

  constructor(response: unknown = "") {
    const responseString = () => {
      if (typeof response === "object") return JSON.stringify(response);
      return `${response}`;
    };

    super(
      `Failed to request to the remote: ${responseString()}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    this.requestResponse = response;
  }
}
