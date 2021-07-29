import { HttpException, HttpStatus } from "@nestjs/common";
import type { ValidationError } from "myzod";

export class ResponseInvalidException extends HttpException {
  validationError: ValidationError;

  constructor(validationError: ValidationError) {
    super(validationError.message, HttpStatus.INTERNAL_SERVER_ERROR);

    this.validationError = validationError;
  }
}
