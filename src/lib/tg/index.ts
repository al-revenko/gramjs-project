import { Api, TelegramClient } from "telegram";
import { ApiCredentials } from "telegram/client/auth";
import { TelegramClientParams } from "telegram/client/telegramBaseClient";
import { StringSession } from "telegram/sessions";
import {
  TgClientNotInitError,
  TgClientError,
  wrapToTgClientError,
} from "./errors";
import { Phone, Username } from "telegram/define";

export interface AuthUserParams {
  phoneNumber: () => Promise<string>;
  password?: () => Promise<string>;
  phoneCode: () => Promise<string>;
  onError?: (err: Error) => void;
}

export class TgClient {
  private client: TelegramClient | null = null;
  private stringSession: StringSession | null = null;

  constructor(
    private apiCredentials: ApiCredentials,
    private params: TelegramClientParams = {},
  ) {}

  async start(sessionStr: string = "") {
    if (this.client) {
      return;
    }

    try {
      this.stringSession = new StringSession(sessionStr);

      this.client = new TelegramClient(
        this.stringSession,
        this.apiCredentials.apiId,
        this.apiCredentials.apiHash,
        this.params,
      );

      await this.connect();
    } catch (error) {
      throw wrapToTgClientError(error);
    }
  }

  async destroy() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }
    } catch (error) {
      throw wrapToTgClientError(error);
    }
  }

  async connect() {
    try {
      await this.client?.connect();
    } catch (error) {
      throw wrapToTgClientError(error);
    }
  }

  async disconnect() {
    try {
      await this.client?.disconnect();
    } catch (error) {
      throw wrapToTgClientError(error);
    }
  }

  async isAuthorized() {
    try {
      return this.client?.isUserAuthorized() ?? false;
    } catch (error) {
      throw wrapToTgClientError(error);
    }
  }

  isInitialized() {
    return this.client !== null;
  }

  async authUser(authParams: AuthUserParams): Promise<string> {
    if (this.client === null || this.stringSession === null) {
      throw new TgClientNotInitError();
    }

    try {
      await this.client.signInUser(this.apiCredentials, {
        phoneNumber: authParams.phoneNumber,
        password: authParams.password,
        phoneCode: authParams.phoneCode,
        onError: authParams.onError ?? (() => {}),
      });

      return this.stringSession.save();
    } catch (err) {
      throw wrapToTgClientError(err);
    }
  }

  async getUser(by: Phone | Username): Promise<Api.User> {
    if (this.client === null) {
      throw new TgClientNotInitError();
    }

    try {
      const entity = await this.client.getEntity(by);

      if (entity instanceof Api.User) {
        return entity;
      }

      throw new TgClientError({ message: "USER_NOT_FOUND", statusCode: 404 });
    } catch (err) {
      if (err instanceof TgClientError) {
        throw err;
      }

      if (err instanceof Error) {
        if (err.message.startsWith("Cannot find any entity")) {
          throw new TgClientError({
            message: "USER_NOT_FOUND",
            statusCode: 404,
          });
        }
      }

      throw wrapToTgClientError(err);
    }
  }

  async sendMessage(user: Api.User, message: string) {
    if (this.client === null) {
      throw new TgClientNotInitError();
    }

    try {
      await this.client.sendMessage(user, {
        message,
      });
    } catch (err) {
      throw wrapToTgClientError(err);
    }
  }
}
