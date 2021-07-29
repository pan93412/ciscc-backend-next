import { Module } from "@nestjs/common";
import { AxiosUtilService } from "../axios-util/axios-util.service";
import { StrapiService } from "./strapi.service";

@Module({
  imports: [AxiosUtilService],
  providers: [StrapiService],
  exports: [StrapiService],
})
export class StrapiModule {}
