import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AxiosUtilModule } from "../axios-util/axios-util.module";
import { StrapiService } from "./strapi.service";

process.env.STRAPI_PATH = "http://192.168.1.106:1337";
process.env.STRAPI_ACCOUNT = "backend@example.com";
process.env.STRAPI_PASSWORD = "backend";

describe("StrapiService", () => {
  let service: StrapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AxiosUtilModule],
      providers: [StrapiService],
    }).compile();

    service = module.get<StrapiService>(StrapiService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login()", () => {
    it("should be available to backend", async () => {
      const login = await service.login();

      expect(login).not.toBe("");
    });
  });
});
