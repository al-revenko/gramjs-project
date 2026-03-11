import type { Server } from "http";
import express, { type Express } from "express";
import { TgClient } from "src/lib/tg";
import { SessionModel } from "src/models/session";
import { CLI } from "src/cli";
import { AuthController } from "src/controllers/auth";

export interface TelegramConfig {
  apiId: number;
  apiHash: string;
}

export interface SessionConfig {
  storePath: string;
}

export interface AppConfig {
  telegram: TelegramConfig;
  session: SessionConfig;
}

export class App {
  private server: Server | null = null;
  private express: Express;
  private tgClient: TgClient;
  private sessionModel: SessionModel;
  private cli: CLI;
  private authController: AuthController;

  constructor(cfg: AppConfig) {
    this.express = express();

    this.sessionModel = new SessionModel(cfg.session.storePath);

    this.tgClient = new TgClient({
      apiId: cfg.telegram.apiId,
      apiHash: cfg.telegram.apiHash,
    });

    this.authController = new AuthController(
      this.express,
      this.tgClient,
      this.sessionModel,
    );

    this.cli = new CLI(
      {
        input: process.stdin,
        output: process.stdout,
      },
      this.authController,
    );
  }

  async run(port: number) {
    const session = await this.sessionModel.getSession();

    await this.tgClient.start(session ?? "");

    const isAuthorized = await this.tgClient.isAuthorized();

    if (!isAuthorized) {
      await this.cli.authUser();
    }

    this.server = this.express.listen(port, (err) => {
      if (err) {
        this.server = null;
        throw err;
      }

      console.log(`app started at ${port} port`);
    });
  }

  async close() {
    console.log("closing app");

    if (this.server) {
      this.server.close();
    }

    if (!this.tgClient.isDestroyed()) {
      await this.tgClient.destroy();
    }

    console.log("app closed");
  }
}
