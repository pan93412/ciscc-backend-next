import { Module } from "@nestjs/common";
import { StrapiModule } from "../strapi/strapi.module";
import { DiscordBotService } from "./discord-bot.service";

@Module({
  imports: [StrapiModule],
  providers: [DiscordBotService],
  exports: [DiscordBotService],
})
export class DiscordBotModule {}
