import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { StrapiModule } from "./strapi/strapi.module";

@Module({
  imports: [ConfigModule.forRoot(), StrapiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
