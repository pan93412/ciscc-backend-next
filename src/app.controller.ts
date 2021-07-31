import { Body, Controller, Get, Ip, Logger, Post, Query } from "@nestjs/common";
import { StrapiService } from "./strapi/strapi.service";
import { AppService } from "./app.service";
import { GetMessagesQuery } from "./app/interfaces/get-messages-query";
import { SendMessageRequest } from "./app/interfaces/send-message-request";

@Controller()
export class AppController {
  private readonly logger = new Logger();

  constructor(
    private appService: AppService,
    private strapiService: StrapiService,
  ) {}

  @Post("/sync/force")
  async syncMessage(@Ip() ip: string) {
    this.logger.log(`${ip} want to sync the messages in queue.`);
    await this.appService.syncApprovedMessages();
  }

  @Post("/messages")
  async sendMessage(@Body() body: SendMessageRequest, @Ip() ip: string) {
    return this.strapiService.sendMessage(body.message, ip);
  }

  @Get("/messages")
  async getMessages(@Query() query: GetMessagesQuery, @Ip() ip: string) {
    this.logger.log(`${ip} try to get the messages.`);
    return this.strapiService.getMessages(query);
  }
}
