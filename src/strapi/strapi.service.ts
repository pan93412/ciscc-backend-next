import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import type { Infer } from "myzod";
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
    return this.axiosUtilService.responseParser(
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
  }

  /**
   * Get the approved but not published message in Strapi.
   */
  async getApprovedUnpublishedMessage() {
    this.logger.verbose("Getting the approved but unpublished messages...");
    const approvedButNotPublished = this.getApi(
      "/messages?approved=true&published=false",
    );

    return this.axiosUtilService.responseParser(
      async () => axios.get(approvedButNotPublished),
      StrapiMessagesResponseSchema,
    );
  }

  /**
   * Update (PUT) the message.
   *
   * @param messageId The message ID
   * @param patch The object to be updated to.
   * @param strapiToken Explicitly specify the Strapi token.
   */
  async updateMessage(
    messageId: number,
    patch: Partial<Infer<typeof StrapiMessagesResponseEntrySchema>>,
    strapiToken?: string,
  ) {
    this.logger.verbose("Updating message...");
    this.logger.verbose(patch);

    const token = strapiToken || (await this.login());
    const specifiedMessage = this.getApi(`/messages/${messageId}`);

    return this.axiosUtilService.responseParser(
      async () =>
        axios.put(
          specifiedMessage,
          patch,
          this.axiosUtilService.getAuthorizationHeader(token),
        ),
      StrapiMessagesResponseEntrySchema,
    );
  }

  /**
   * Delete the message.
   *
   * @param messageId The message ID
   * @param strapiToken Explicitly specify the Strapi token.
   */
  async deleteMessage(messageId: number, strapiToken?: string) {
    this.logger.verbose("Deleting message...");

    const token = strapiToken || (await this.login());
    const specifiedMessage = this.getApi(`/messages/${messageId}`);

    return this.axiosUtilService.responseParser(
      async () =>
        axios.delete(
          specifiedMessage,
          this.axiosUtilService.getAuthorizationHeader(token),
        ),
      StrapiMessagesResponseEntrySchema,
    );
  }

  /**
   * Set the message as approved.
   *
   * @see updateMessage
   */
  async setApproved(messageId: number, strapiToken?: string) {
    return this.updateMessage(
      messageId,
      {
        approved: true,
      },
      strapiToken,
    );
  }

  /**
   * Set the message as published.
   *
   * @see updateMessage
   */
  async setPublished(messageId: number, strapiToken?: string) {
    return this.updateMessage(
      messageId,
      {
        published: true,
      },
      strapiToken,
    );
  }
}
