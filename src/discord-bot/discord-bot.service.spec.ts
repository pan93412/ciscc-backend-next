import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import type { Channel } from "discord.js";
import { StrapiModule } from "../strapi/strapi.module";
import { DiscordBotService } from "./discord-bot.service";
import { SERVICE_MESSAGE_PREFIX, TRASH_BIN_EMOJI } from "./utility/consts";

describe("DiscordBotService", () => {
  let service: DiscordBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), StrapiModule],
      providers: [DiscordBotService],
    }).compile();

    service = module.get<DiscordBotService>(DiscordBotService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getMessageChannel())", () => {
    it("should not be null", async () => {
      await service.login();
      await expect(service.getMessageChannel()).resolves.not.toBe(null);
    }, 15000);
  });

  describe("isTextChannel()", () => {
    it(".type === 'text', returns true", () => {
      expect(
        service.isTextChannel({
          type: "text",
        } as unknown as Channel),
      ).toBe(true);
    });
    it(".type !== 'text', returns false", () => {
      expect(
        service.isTextChannel({
          type: "a",
        } as unknown as Channel),
      ).toBe(false);
    });
  });

  describe("getTextChannel", () => {
    it("should not be null", async () => {
      await service.login();
      await expect(service.getTextChannel()).resolves.not.toBe(null);
    }, 15000);
  });

  describe("sendMessage()", () => {
    it("can send message", async () => {
      const text = "Hello, World!";
      await service.login();
      await expect(
        service.sendMessage(text).then((m) => m.content),
      ).resolves.toBe(text);
    }, 15000);
  });

  describe("sendServiceMessage()", () => {
    it("can send the service message", async () => {
      const text = "這是個服務訊息，請檢查是否有垃圾桶按鈕。";
      await service.login();
      await expect(
        service
          .sendServiceMessage(text)
          .then(
            (m) =>
              m.reactions.resolve(TRASH_BIN_EMOJI)?.count &&
              m.content === `${SERVICE_MESSAGE_PREFIX}${text}`,
          ),
      ).resolves.toBeTruthy();
    }, 15000);
  });
});
