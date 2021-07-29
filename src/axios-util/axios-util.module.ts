import { Module } from "@nestjs/common";
import { AxiosUtilService } from "./axios-util.service";

@Module({
  providers: [AxiosUtilService],
  exports: [AxiosUtilService],
})
export class AxiosUtilModule {}
