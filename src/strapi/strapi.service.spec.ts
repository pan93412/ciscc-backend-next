import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AxiosUtilModule } from "../axios-util/axios-util.module";
import type { Depromise } from "../common/type-utils";
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

  describe("getMessage[s]() & its dependencies", () => {
    let message: Depromise<ReturnType<typeof service.sendMessage>> | null =
      null;

    it("sendMessage() should create a message", async () => {
      const messageText = "Hello, World!";
      const ip = "192.168.1.1";
      const sentMsg = await service.sendMessage(messageText, ip);

      expect(sentMsg.message).toBe(messageText);
      message = sentMsg;
    });

    it("getMessages() should include the sent message", async () => {
      await expect(
        service.getMessages({ id: message?.id }).then((v) => v.length),
      ).resolves.toBe(1);
    });

    it("getMessages() should return an empty array if this message does not exist", async () => {
      await expect(
        service.getMessages({ id: -1 }).then((v) => v.length),
      ).resolves.toBe(0);
    });

    it("getMessage() should return the sent message", async () => {
      if (!message) throw new Error("assert: message != null");

      await expect(service.getMessage(message?.id)).resolves.toStrictEqual(
        message,
      );
    });

    it("getMessage() should return null if this message does not exist", async () => {
      if (!message) throw new Error("assert: message != null");

      await expect(service.getMessage(-1)).resolves.toBe(null);
    });

    it("deleteMessage() should delete message if the id is correct", async () => {
      if (!message) throw new Error("assert: message != null");
      await expect(service.deleteMessage(message.id)).resolves.toBeDefined();
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

  describe("setApproved(), isMessageApprovedButUnpublished() and its dependencies", () => {
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

    it('isMessageApprovedButUnpublished() should indicate the approved message "true"', async () => {
      await expect(
        service.isMessageApprovedButUnpublished(messageId),
      ).resolves.toBe(true);
    });

    it("setApproved() with truthy=false should make the specified message not approved", async () => {
      await expect(
        service.setApproved(messageId, false).then((m) => m.approved),
      ).resolves.toBe(false);
    });

    it('isMessageApprovedButUnpublished() should indicate the non-approved message "false"', async () => {
      await expect(
        service.isMessageApprovedButUnpublished(messageId),
      ).resolves.toBe(false);
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
