import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { StrapiModule } from "./strapi/strapi.module";
import { DiscordBotModule } from "./discord-bot/discord-bot.module";

@Module({
  imports: [ConfigModule.forRoot(), StrapiModule, DiscordBotModule],
  controllers: [AppController],
})
export class AppModule {}
