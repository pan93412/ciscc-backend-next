import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { Cron } from "@nestjs/schedule";
import { AxiosUtilService } from "../axios-util/axios-util.service";
import type {
  StrapiAuthRequest,
  StrapiMessagesPostRequest,
} from "./strapi.interface";
import {
  StrapiAuthResponseSchema,
  StrapiMessagesResponseEntrySchema,
  StrapiMessagesResponseSchema,
} from "./strapi.interface";

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name);

  constructor(private axiosUtilService: AxiosUtilService) {}

  /**
   * Get the API path with the specified method
   *
   * @param method The method to call
   * @returns The API path that can be used on Axios.
   */
  private getApi(method: string): string {
    if (!process.env.STRAPI_PATH || process.env.STRAPI_PATH === "")
      throw new Error("You should specify 'STRAPI_PATH' environment variable.");

    return `${process.env.STRAPI_PATH}${method}`;
  }

  /**
   * Login to Strapi.
   *
   * @returns JWT token for logging in
   */
  async login(): Promise<string | never> {
    this.logger.verbose("Logging in...");
    const response = await this.axiosUtilService.responseParser(
      async () =>
        axios.post<unknown>(this.getApi("/auth/local"), {
          identifier: process.env.STRAPI_ACCOUNT,
          password: process.env.STRAPI_PASSWORD,
        } as StrapiAuthRequest),
      StrapiAuthResponseSchema,
    );

    return response.jwt;
  }

  /**
   * Send a message to Strapi.
   * @param message The message body (Markdown supported)
   * @param ip The sender.
   * @param strapiToken Explicitly specify the Strapi token.
   */
  async sendMessage(message: string, ip: string, strapiToken?: string) {
    const token = strapiToken || (await this.login());

    this.logger.verbose("Sending message...");
    const response = await this.axiosUtilService.responseParser(
      async () =>
        axios.post<unknown>(
          this.getApi("/messages"),
          {
            message,
            ip_address: ip,
          } as StrapiMessagesPostRequest,
          this.axiosUtilService.getAuthorizationHeader(token),
        ),
      StrapiMessagesResponseEntrySchema,
    );

    return response;
  }

  /**
   * Publish the approved message in Strapi.
   *
   * It will be run every minutes.
   */
  @Cron("* */1 * * * *")
  async publishApprovedMessage() {
    const approvedButNotPublished = this.getApi(
      "/messages?approved=true&published=false",
    );

    const response = await this.axiosUtilService.responseParser(
      async () => axios.get(approvedButNotPublished),
      StrapiMessagesResponseSchema,
    );

    console.log(response);
    throw new Error("not implemented");
  }
}