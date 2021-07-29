import { Module } from "@nestjs/common";
import { AxiosUtilModule } from "../axios-util/axios-util.module";
import { StrapiService } from "./strapi.service";

@Module({
  imports: [AxiosUtilModule],
  providers: [StrapiService],
  exports: [StrapiService],
})
export class StrapiModule {}
