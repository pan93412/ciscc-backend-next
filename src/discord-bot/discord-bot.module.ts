import { Module } from "@nestjs/common";
import { DiscordModule, TransformPipe, ValidationPipe } from "discord-nestjs";
import { DiscordBotService } from "./discord-bot.service";

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useFactory: () => {
        const botToken = process.env.DISCORD_BOT_TOKEN;

        if (!botToken)
          throw new Error(
            "You should specify DISCORD_BOT_TOKEN environment variable.",
          );

        // https://github.com/fjodor-rybakov/discord-nestjs#-overview-
        return {
          token: botToken,
          commandPrefix: "!ciscc:",
          usePipes: [TransformPipe, ValidationPipe],
        };
      },
    }),
  ],
  providers: [DiscordBotService],
})
export class DiscordBotModule {}
