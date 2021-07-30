import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AxiosUtilModule } from "../axios-util/axios-util.module";
import { StrapiService } from "./strapi.service";

describe("StrapiService", () => {
  let service: StrapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AxiosUtilModule],
      providers: [StrapiService],
    }).compile();

    service = module.get<StrapiService>(StrapiService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login()", () => {
    it("should get the valid JWT", async () => {
      const login = await service.login();
      expect(login).not.toBe("");
    });
  });

  describe("sendMessage() & deleteMessage()", () => {
    let messageId = -1;

    it("sendMessage() should create a message", async () => {
      const message = "Hello, World!";
      const ip = "192.168.1.1";
      const sentMsg = await service.sendMessage(message, ip);

      expect(sentMsg.message).toBe(message);
      messageId = sentMsg.id;
    });

    it("deleteMessage() should delete message if the id is correct", async () => {
      await expect(service.deleteMessage(messageId)).resolves.toBeDefined();
    });

    it("deleteMessage() should throw error if the id is incorrect", async () => {
      await expect(service.deleteMessage(messageId)).rejects;
    });
  });

  describe("updateMessage() and its dependencies", () => {
    let messageId = -1;

    it("sendMessage() should create a message", async () => {
      const message = "Hello, World!";
      const ip = "192.168.1.1";
      const sentMsg = await service.sendMessage(message, ip);

      expect(sentMsg.message).toBe(message);
      messageId = sentMsg.id;
    });

    it("updateMessage() should patch the message with the specified one", async () => {
      const newMessage = "aaa";

      await expect(
        service
          .updateMessage(messageId, {
            message: newMessage,
          })
          .then((m) => m.message),
      ).resolves.toBe(newMessage);
    });

    it("deleteMessage() should delete message if the id is correct", async () => {
      await expect(service.deleteMessage(messageId)).resolves.toBeDefined();
    });
  });

  describe("setApproved() and its dependencies", () => {
    let messageId = -1;

    it("sendMessage() should create a message", async () => {
      const message = "Hello, World!";
      const ip = "192.168.1.1";
      const sentMsg = await service.sendMessage(message, ip);

      expect(sentMsg.message).toBe(message);
      messageId = sentMsg.id;
    });

    it("setApproved() should make the specified message approved", async () => {
      await expect(
        service.setApproved(messageId).then((m) => m.approved),
      ).resolves.toBe(true);
    });

    it("deleteMessage() should delete message if the id is correct", async () => {
      await expect(service.deleteMessage(messageId)).resolves.toBeDefined();
    });
  });

  describe("setSubmitted() and its dependencies", () => {
    let messageId = -1;

    it("sendMessage() should create a message", async () => {
      const message = "Hello, World!";
      const ip = "192.168.1.1";
      const sentMsg = await service.sendMessage(message, ip);

      expect(sentMsg.message).toBe(message);
      messageId = sentMsg.id;
    });

    it("setPublished() should make the status of the specified message published", async () => {
      await expect(
        service.setPublished(messageId).then((m) => m.published),
      ).resolves.toBe(true);
    });

    it("deleteMessage() should delete message if the id is correct", async () => {
      await expect(service.deleteMessage(messageId)).resolves.toBeDefined();
    });
  });
});
