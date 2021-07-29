import { Injectable, Logger } from "@nestjs/common";
import type { AnyType, Infer } from "myzod";
import axios from "axios";
import myzod from "myzod";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { ResponseInvalidException } from "./exceptions/response-invalid.exception";
import { RequestFailedException } from "./exceptions/request-failed.exception";

@Injectable()
export class AxiosUtilService {
  private readonly logger = new Logger(AxiosUtilService.name);

  /**
   * Parse the response.
   *
   * @param requester The requester that will returns an `axios` response.
   * @param schema The type schema
   * @exception RequestFailed, ResponseInvalid
   */
  async responseParser<T extends AnyType>(
    requester: () => Promise<AxiosResponse<unknown>>,
    schema: T,
  ): Promise<Infer<T>> {
    try {
      const response = await requester();

      if (response.status >= 200 && response.status <= 299) {
        this.logger.verbose("Checking response...");
        const { data } = response;
        const parsedData = schema.try(data);

        if (parsedData instanceof myzod.ValidationError) {
          this.logger.error("The response is invalid.");
          this.logger.error(`Server response: ${JSON.stringify(data)}`);
          this.logger.error(`${parsedData.name}: ${parsedData.message}`);
          throw new ResponseInvalidException(parsedData);
        }

        this.logger.verbose("Returning the parsed data...");
        return parsedData;
      }
    } catch (e: unknown) {
      this.logger.error("Failed to request.");

      if (axios.isAxiosError(e)) {
        this.logger.error(e.toJSON());
        throw new RequestFailedException(e.toJSON());
      }

      throw e; // ResponseInvalidException
    }

    return Promise.reject();
  }

  /**
   * Get the authorization header.
   *
   * @param bearerToken The bearer token, usually the JWT token.
   * @param extra The extra header.
   */
  getAuthorizationHeader(
    bearerToken: string,
    extra: AxiosRequestConfig = {},
  ): AxiosRequestConfig {
    return {
      ...extra,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
  }
}
