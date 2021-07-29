import { Injectable, Logger } from "@nestjs/common";
import { DiscordClientProvider, Once, OnCommand } from "discord-nestjs";
import { Message } from "discord.js";

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);

  constructor(private readonly discordProvider: DiscordClientProvider) {}

  @Once({ event: "ready" })
  async onReady(): Promise<void> {
    const client = this.discordProvider.getClient();

    if (client) {
      this.logger.log(`Logged in as ${client.user?.tag}!`);
    }
  }

  @OnCommand({ name: "channel-info" })
  async getChannelInfo(message: Message): Promise<void> {
    this.logger.verbose("getChannelInfo: begin!");
    await message.reply(JSON.stringify(message.channel));
    this.logger.verbose("getChannelInfo: done!");
  }
}
