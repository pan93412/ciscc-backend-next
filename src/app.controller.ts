import { Body, Controller, Ip, Logger, Post } from "@nestjs/common";
import { StrapiService } from "./strapi/strapi.service";
import { AppService } from "./app.service";
import { SendMessageRequest } from "./app.interface";

@Controller()
export class AppController {
  private readonly logger = new Logger();

  constructor(
    private appService: AppService,
    private strapiService: StrapiService,
  ) {}

  @Post("/message")
  async sendMessage(@Body() body: SendMessageRequest, @Ip() ip: string) {
    return this.strapiService.sendMessage(body.message, ip);
  }
}
