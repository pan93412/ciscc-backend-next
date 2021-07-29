import { Body, Controller, Ip, Post } from "@nestjs/common";
import { StrapiService } from "./strapi/strapi.service";

@Controller()
export class AppController {
  constructor(private strapiService: StrapiService) {}

  @Post()
  async sendMessage(@Body("message") message: string, @Ip() ip: string) {
    return this.strapiService.sendMessage(message, ip);
  }
}
