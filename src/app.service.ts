import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StrapiService } from "./strapi/strapi.service";
import { DiscordBotService } from "./discord-bot/discord-bot.service";
import { ComplainMessage } from "./ciscc/message-template";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly strapiService: StrapiService,
    private readonly discordService: DiscordBotService,
  ) {}

  @Cron("0 */1 * * * *")
  async syncApprovedMessages() {
    this.logger.log("Start syncing approved messages...");

    const unpublishedMessages =
      await this.strapiService.getApprovedUnpublishedMessages();

    await Promise.all(
      unpublishedMessages.map(async (message) => {
        try {
          this.logger.debug(
            `Message #${message.id}: Sending message to Discord`,
          );
          await this.discordService.forwardAnonymousMessage(
            ComplainMessage(message),
          );

          this.logger.debug(`Message #${message.id}: Marking as 'published'`);
          await this.strapiService.setPublished(message.id);

          this.logger.log(`Synced: #${message.id}`);
        } catch (e) {
          this.logger.error(`Sync failed: #${message.id}`);
          this.logger.error(e);
        }
      }),
    );

    this.logger.log("End syncing approved messages.");
  }
}
