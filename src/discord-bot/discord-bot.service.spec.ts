import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import type { Channel } from "discord.js";
import { DiscordBotService } from "./discord-bot.service";

describe("DiscordBotService", () => {
  let service: DiscordBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [DiscordBotService],
    }).compile();

    service = module.get<DiscordBotService>(DiscordBotService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getMessageChannel())", () => {
    jest.setTimeout(15000); // since it make 2 requests
    it("should not be null", async () => {
      await service.login();
      await expect(service.getMessageChannel()).resolves.not.toBe(null);
    });
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
    jest.setTimeout(15000); // since it make 2 requests
    it("should not be null", async () => {
      await service.login();
      await expect(service.getTextChannel()).resolves.not.toBe(null);
    });
  });

  describe("sendMessage()", () => {
    jest.setTimeout(15000); // since it make 2 requests
    it("can send message", async () => {
      const text = "Hello, World!";
      await service.login();
      await expect(
        service.sendMessage(text).then((m) => m.content),
      ).resolves.toBe(text);
    });
  });
});
