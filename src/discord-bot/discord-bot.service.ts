import { Injectable, Logger } from "@nestjs/common";
import type { Channel, TextChannel, ClientEvents } from "discord.js";
import { Message, Client, MessageReaction } from "discord.js";
import { StrapiService } from "../strapi/strapi.service";
import { OnCommand, OnEvent } from "./utility/metadata-decorator";
import { MetadataKeys } from "./utility/metadata-keys";
import {
  APPROVE_COMMAND_MESSAGE_MATCHER,
  DISCORD_COMMAND_PREFIX,
  REJECT_COMMAND_MESSAGE_MATCHER,
  SERVICE_MESSAGE_MATCHER,
  SERVICE_MESSAGE_PREFIX,
  TRASH_BIN_EMOJI,
} from "./utility/consts";
import { InvalidChannelException } from "./exceptions/invalid-channel.exception";

@Injectable()
export class DiscordBotService {
  private client = new Client();

  private static messageChannel: Channel | null = null;

  private readonly logger = new Logger(DiscordBotService.name);

  constructor(private readonly strapiService: StrapiService) {}

  /**
   * Log in the Discord Bot
   */
  async login() {
    if (process.env.DISCORD_BOT_TOKEN) {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } else {
      throw new Error(
        "You should specify DISCORD_BOT_TOKEN environment variable",
      );
    }
  }

  /**
   * It will run in the bootstrap stage. Don't trigger it manually!
   */
  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([this.registerMethod(), this.login()]);
  }

  /**
   * It will run in the destroy stage. Don't trigger it manually!
   */
  async onModuleDestroy(): Promise<void> {
    this.client.destroy();
  }

  /**
   * Register the specified event to the Discord bot.
   *
   * @param event the event naame
   * @param func the event listener
   * @private
   */
  private registerEvent(
    event: keyof ClientEvents,
    func: (...args: any[]) => void,
  ) {
    this.client.on(event, func.bind(this));
  }

  /**
   * Register a command to the Discord bot
   * @param command The command without the prefix.
   * @param func The listener.
   * @private
   */
  private registerCommandEvent(
    command: string,
    func: (message: Message) => void,
  ) {
    const prefixedCmd = `${DISCORD_COMMAND_PREFIX}${command}`;
    const boundFunc = func.bind(this);

    this.registerEvent("message", (message: Message) => {
      if (message.content.startsWith(prefixedCmd)) {
        boundFunc(message);
      }
    });
  }

  /**
   * Register all the event listener and command listener
   * in this class.
   *
   * It will be run in the onApplicationBootstrap stage;
   * thus, you should never call it manually.
   *
   * It extracts all the event & command with @OnEvent / @OnCommand
   * decorator, and register them.
   * @private
   */
  private async registerMethod() {
    const properties = Object.getOwnPropertyDescriptors(
      Object.getPrototypeOf(this),
    );

    Object.entries(properties).forEach(([methodName, method]) => {
      const target = method.value;

      if (typeof target !== "function") {
        this.logger.debug(`${methodName} is not a function - skipped.`);
        return;
      }

      this.logger.log(`Processing: ${methodName}`);
      const customEvent: keyof ClientEvents = Reflect.getMetadata(
        MetadataKeys.EVENT,
        target,
      );
      if (customEvent) {
        this.logger.log(`Register: ${methodName} (${MetadataKeys.EVENT})`);
        this.registerEvent(customEvent, target);
        return;
      }

      const command: string = Reflect.getMetadata(MetadataKeys.COMMAND, target);
      if (command) {
        this.logger.log(`Register: ${methodName} (${MetadataKeys.COMMAND})`);
        this.registerCommandEvent(command, target);
        return;
      }

      this.logger.debug(`${methodName} matches none. Ignoring.`);
    });
  }

  /**
   * Get the message channel that the message should be sent to.
   */
  async getMessageChannel(): Promise<Channel | null> {
    if (!DiscordBotService.messageChannel) {
      const defaultChannel = process.env.DISCORD_DEFAULT_CHANNEL;
      if (!defaultChannel) {
        this.logger.warn(
          "You didn't specify the default channel. Ignoring sendMessage() request.",
        );
        return null;
      }

      DiscordBotService.messageChannel = await this.client.channels.fetch(
        defaultChannel,
      );
    }

    return DiscordBotService.messageChannel;
  }

  /**
   * Check if the specified Channel is a text channel.
   */
  isTextChannel(channel: Channel): channel is TextChannel {
    return channel.type === "text";
  }

  isCommandChannel(channel: Channel): boolean {
    return channel.id === process.env.DISCORD_APPROVE_RECEIVE_CHANNEL;
  }

  /**
   * Get the text channel that the message should be sent to.
   */
  async getTextChannel(): Promise<TextChannel | null> {
    const channel = await this.getMessageChannel();
    if (!channel) return null;

    if (this.isTextChannel(channel)) {
      return channel;
    }

    this.logger.warn(`${channel.id} is not a text channel.`);
    return null;
  }

  /**
   * Send the message to the text channel
   * @param message The message.
   * @param channel The channel the message should send to.
   * If not specified, it uses the configuration value.
   */
  async sendMessage(message: string, channel?: TextChannel): Promise<Message> {
    this.logger.debug("sendMessage: begin!");
    const theChannel = channel || (await this.getTextChannel());
    if (!theChannel) throw new InvalidChannelException();

    this.logger.debug("sendMessage: end!");
    return theChannel.send(message);
  }

  /**
   * Send the service message.
   *
   * The service message can be automatically removed after clicking TRASH_BIN_EMOJI.
   *
   * @see sendMessage
   */
  async sendServiceMessage(
    message: string,
    channel?: TextChannel,
  ): Promise<Message> {
    this.logger.debug("sendServiceMessage: begin!");

    const sentMessage = await this.sendMessage(
      `${SERVICE_MESSAGE_PREFIX}${message}`,
      channel,
    );
    await sentMessage.react(TRASH_BIN_EMOJI);

    this.logger.debug("sendServiceMessage: end!");
    return sentMessage;
  }

  /**
   * Forward the anonymous message.
   *
   * @see sendMessage
   */
  async forwardAnonymousMessage(
    message: string,
    channel?: TextChannel,
  ): Promise<Message | null> {
    this.logger.debug("forwardAnonymousMessage: begin!");

    const sentMessage = await this.sendMessage(message, channel);
    await Promise.all([
      sentMessage.react("👍"),
      sentMessage.react("👎"),
      sentMessage.react("❤️"),
      sentMessage.react("🤔"),
      sentMessage.react("😡"),
    ]);

    this.logger.debug("forwardAnonymousMessage: end!");
    return sentMessage;
  }

  /**
   * It will be triggered when the bot is ready.
   */
  @OnEvent("ready")
  async onReady(): Promise<void> {
    this.logger.log(`Logged in as ${this.client.user?.tag}!`);
  }

  /**
   * It will be triggered after someone reacted TRASH_BIN_EMOJI.
   */
  @OnEvent("messageReactionAdd")
  async recycleMessage(reaction: MessageReaction): Promise<void> {
    this.logger.debug("recycleMessage: begin!");
    const me = this.client.user;

    if (
      // Is this.client.user !== null
      me &&
      // Is reaction.count !== null
      reaction.count &&
      // The reaction is a trash bin
      reaction.emoji.name === TRASH_BIN_EMOJI &&
      // More than 2 of people have given the same reaction
      reaction.count >= 2 &&
      // The message of the reacted message is from this bot
      reaction.message.author.equals(me) &&
      // Is the message the service message?
      // (Prevent the normal message to be maliciously removed)
      reaction.message.content.match(SERVICE_MESSAGE_MATCHER)
    ) {
      this.logger.verbose(`recycleMessage: removing: ${reaction.message.id}`);
      await reaction.message.delete();
    }

    this.logger.debug("recycleMessage: done!");
  }

  /**
   * It will be triggered after someone said "CISCC 請列出群組資訊".
   */
  @OnCommand("請列出群組資訊")
  async getChannelInfo(message: Message): Promise<void> {
    this.logger.debug("getChannelInfo: begin!");
    if (this.isTextChannel(message.channel))
      await this.sendServiceMessage(
        JSON.stringify(message.channel),
        message.channel,
      );
    this.logger.debug("getChannelInfo: done!");
  }

  /**
   * It will be triggered after someone said "CISCC 我核可 #{ID}"。
   *
   * The `{ID}` can be any valid numeric value.
   *
   * @see APPROVE_COMMAND_MESSAGE_MATCHER
   */
  @OnEvent("message")
  async approveMessage(message: Message): Promise<void> {
    if (
      !message.content.startsWith(DISCORD_COMMAND_PREFIX) ||
      !this.isTextChannel(message.channel) ||
      !this.isCommandChannel(message.channel)
    )
      return;
    this.logger.debug(`approveMessage: triggered by ${message.author.id}`);

    const commandMatch = message.content.match(APPROVE_COMMAND_MESSAGE_MATCHER);
    if (commandMatch && commandMatch[1]) {
      try {
        const postId = Number(commandMatch[1]);
        await this.strapiService.setApproved(postId, true);
        await message.reply(`那我就幫你送出 #${postId} 囉！ #APPROVED #CISCC`);
      } catch (e: unknown) {
        await this.sendServiceMessage(
          "很遺憾，無法完成您的請求。<@557530951824048140> 出來處理。",
          message.channel,
        );
        this.logger.error(e);
      }
    }

    this.logger.debug(`approveMessage: done!`);
  }

  /**
   * It will be triggered after someone said "CISCC 我拒絕 #{ID}"。
   *
   * The `{ID}` can be any valid numeric value.
   *
   * @see REJECT_COMMAND_MESSAGE_MATCHER
   */
  @OnEvent("message")
  async rejectMessage(message: Message): Promise<void> {
    if (
      !message.content.startsWith(DISCORD_COMMAND_PREFIX) ||
      !this.isTextChannel(message.channel) ||
      !this.isCommandChannel(message.channel)
    )
      return;
    this.logger.debug(`rejectMessage: triggered by ${message.author.id}`);

    const commandMatch = message.content.match(REJECT_COMMAND_MESSAGE_MATCHER);
    if (commandMatch && commandMatch[1]) {
      try {
        const postId = Number(commandMatch[1]);
        const isMessageApprovedButUnpublished =
          await this.strapiService.isMessageApprovedButUnpublished(postId);

        if (isMessageApprovedButUnpublished) {
          await this.strapiService.setApproved(postId, false);
          await message.reply(`我會拒絕發布這則訊息。#REJECTED #CISCC`);
        } else {
          await this.sendServiceMessage(
            "這則訊息不在待發布佇列中。",
            message.channel,
          );
        }
      } catch (e: unknown) {
        await this.sendServiceMessage(
          "很遺憾，無法完成您的請求。<@557530951824048140> 出來處理。",
          message.channel,
        );
        this.logger.error(e);
      }
    }

    this.logger.debug(`rejectMessage: done!`);
  }
}
