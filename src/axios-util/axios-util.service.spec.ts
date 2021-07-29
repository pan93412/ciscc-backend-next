import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import myzod from "myzod";
import type { AxiosResponse } from "axios";
import { AxiosUtilService } from "./axios-util.service";
import { RequestFailedException } from "./exceptions/request-failed.exception";
import { ResponseInvalidException } from "./exceptions/response-invalid.exception";

describe("AxiosUtilService", () => {
  let service: AxiosUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AxiosUtilService],
    }).compile();

    service = module.get<AxiosUtilService>(AxiosUtilService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("responseParser", () => {
    const mockSchema = myzod.string();
    const shouldThrowRequestFailed = {
      data: "failed to request",
      status: 404,
      statusText: "",
      headers: null,
      config: null,
      request: null,
    } as AxiosResponse<unknown>;
    const shouldThrowResponseInvalid = {
      data: 123456,
      status: 200,
      statusText: "",
      headers: null,
      config: null,
      request: null,
    } as AxiosResponse<unknown>;
    const shouldPass = {
      data: "hi",
      status: 200,
      statusText: "",
      headers: null,
      config: null,
      request: null,
    } as AxiosResponse<unknown>;

    it("throw RequestFailed if status is between 200~300", () => {
      expect(() =>
        service.responseParser(shouldThrowRequestFailed, mockSchema),
      ).toThrow(RequestFailedException);
    });

    it("throw ResponseInvalidException if the response didn't match the schema", () => {
      expect(() =>
        service.responseParser(shouldThrowResponseInvalid, mockSchema),
      ).toThrow(ResponseInvalidException);
    });

    it("returns the response data if the response matches the schema & status is between 200~300", () => {
      expect(service.responseParser(shouldPass, mockSchema)).toStrictEqual(
        shouldPass.data,
      );
    });
  });

  describe("getAuthorizationHeader", () => {
    it("pass a bearer token, return the header", () => {
      expect(service.getAuthorizationHeader("12345")).toStrictEqual({
        Authorization: "Bearer 12345",
      });
    });

    it("pass a bearer token and the extra header, return the merged header", () => {
      expect(
        service.getAuthorizationHeader("12345", { hi: "world" }),
      ).toStrictEqual({
        Authorization: "Bearer 12345",
        hi: "world",
      });
    });

    it("our Authorization is higher than extra headers", () => {
      expect(
        service.getAuthorizationHeader("12345", { Authorization: "Hi" }),
      ).toStrictEqual({
        Authorization: "Bearer 12345",
      });
    });
  });
});
