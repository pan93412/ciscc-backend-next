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

      console.log(login);
      expect(login).not.toBe("");
    });
  });

  describe("sendMessage()", () => {
    it("should returns 200", async () => {
      const message = "Hello, World!";
      const ip = "192.168.1.1";
      const login = await service.sendMessage(message, ip);

      expect(login.message).toBe(message);
    });
  });
});
