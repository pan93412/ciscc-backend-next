import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { StrapiModule } from "./strapi/strapi.module";
import { DiscordBotModule } from "./discord-bot/discord-bot.module";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    StrapiModule,
    DiscordBotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
