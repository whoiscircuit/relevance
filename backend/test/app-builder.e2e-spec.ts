import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppBuilderController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("/api/app-builder/pre-fetch (POST)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/app-builder/pre-fetch")
      .send({ type: "upload-apk", body: { hash: "a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5a3f5", filetype: "apk" } })
      .expect(200);
    expect(res.body.connectionId).toBeDefined();
    expect(typeof res.body.connectionId).toBe("string");
  });
});
