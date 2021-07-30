import { Injectable, Logger } from "@nestjs/common";
import type { Channel, TextChannel } from "discord.js";
import { Message, Client, MessageReaction } from "discord.js";
import { OnCommand, OnEvent } from "./utility/metadata-decorator";
import { MetadataKeys } from "./utility/metadata-keys";
import {
  DISCORD_COMMAND_PREFIX,
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

  async login() {
    if (process.env.DISCORD_BOT_TOKEN) {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } else {
      throw new Error(
        "You should specify DISCORD_BOT_TOKEN environment variable",
      );
    }
  }

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([this.registerMethod(), this.login()]);
  }

  async onModuleDestroy(): Promise<void> {
    this.client.destroy();
  }

  @OnEvent("ready")
  async onReady(): Promise<void> {
    this.logger.log(`Logged in as ${this.client.user?.tag}!`);
  }

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

  @OnCommand("請列出群組資訊") // CISCC 請列出群組資訊
  async getChannelInfo(message: Message): Promise<void> {
    this.logger.debug("getChannelInfo: begin!");
    const sentMsg = await message.reply(JSON.stringify(message.channel));
    await sentMsg.react(TRASH_BIN_EMOJI);
    this.logger.debug("getChannelInfo: done!");
  }

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

  isTextChannel(channel: Channel): channel is TextChannel {
    return channel.type === "text";
  }

  async getTextChannel(): Promise<TextChannel | null> {
    const channel = await this.getMessageChannel();
    if (!channel) return null;

    if (this.isTextChannel(channel)) {
      return channel;
    }

    this.logger.warn(`${channel.id} is not a text channel.`);
    return null;
  }

  async sendMessage(message: string): Promise<Message> {
    this.logger.debug("sendMessage: begin!");
    const channel = await this.getTextChannel();
    if (!channel) throw new InvalidChannelException();

    this.logger.debug("sendMessage: end!");
    return channel.send(message);
  }

  async sendServiceMessage(message: string): Promise<Message> {
    this.logger.debug("sendServiceMessage: begin!");
    const channel = await this.getTextChannel();
    if (!channel) throw new InvalidChannelException();

    const sentMessage = await channel.send(
      `${SERVICE_MESSAGE_PREFIX}${message}`,
    );
    await sentMessage.react(TRASH_BIN_EMOJI);

    this.logger.debug("sendServiceMessage: end!");
    return sentMessage;
  }

  private registerEvent(event: string, func: (...args: any[]) => void) {
    this.client.on(event, func.bind(this));
  }

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
      const customEvent: string = Reflect.getMetadata(
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
}
