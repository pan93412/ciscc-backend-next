import { Injectable, Logger } from "@nestjs/common";
import type { AnyType, Infer } from "myzod";
import myzod from "myzod";
import type { AxiosResponse } from "axios";
import { ResponseInvalidException } from "./exceptions/response-invalid.exception";
import { RequestFailedException } from "./exceptions/request-failed.exception";

@Injectable()
export class AxiosUtilService {
  private readonly logger = new Logger(AxiosUtilService.name);

  /**
   * Parse the response.
   *
   * @param response The `axios` response.
   * @param schema The type schema
   * @exception RequestFailed, ResponseInvalid
   */
  responseParser<T extends AnyType>(
    response: AxiosResponse<unknown>,
    schema: T,
  ): Infer<T> | never {
    if (response.status >= 200 && response.status <= 299) {
      this.logger.verbose("Checking response...");
      const { data } = response;
      const parsedData = schema.try(data);

      if (parsedData instanceof myzod.ValidationError) {
        this.logger.warn("The response is invalid.");
        this.logger.warn(`Server response: ${JSON.stringify(data)}`);
        this.logger.warn(`${parsedData.name}: ${parsedData.message}`);
        throw new ResponseInvalidException(parsedData);
      }

      this.logger.verbose("Returning the parsed data...");
      return parsedData;
    }

    this.logger.warn("Failed to request.");
    this.logger.warn(`HTTP code: ${response.status}`);
    throw new RequestFailedException();
  }

  /**
   * Get the authorization header.
   *
   * @param bearerToken The bearer token, usually the JWT token.
   * @param extra The extra header.
   */
  getAuthorizationHeader(
    bearerToken: string,
    extra: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      ...extra,
      Authorization: `Bearer ${bearerToken}`,
    };
  }
}
