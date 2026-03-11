import { TelegramClient } from "telegram";
import { ApiCredentials } from "telegram/client/auth";
import { TelegramClientParams } from "telegram/client/telegramBaseClient";
import { StringSession } from "telegram/sessions";

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

    this.stringSession = new StringSession(sessionStr);

    this.client = new TelegramClient(
      this.stringSession,
      this.apiCredentials.apiId,
      this.apiCredentials.apiHash,
      this.params,
    );

    await this.connect();
  }

  async destroy() {
    if (this.client) {
      this.client?.destroy();
      this.client = null;
    }
  }

  async connect() {
    await this.client?.connect();
  }

  async disconnect() {
    await this.client?.disconnect();
  }

  async isAuthorized() {
    return this.client?.isUserAuthorized() ?? false;
  }

  async isDestroyed() {
    return this.client === null;
  }

  async authUser(authParams: AuthUserParams): Promise<string> {
    if (this.client === null || this.stringSession === null) {
      throw new Error("Client is not initialized");
    }

    const isAuthorized = await this.isAuthorized();

    if (isAuthorized) {
      throw new Error("User is already authorized");
    }

    await this.client.signInUser(this.apiCredentials, {
      phoneNumber: authParams.phoneNumber,
      password: authParams.password,
      phoneCode: authParams.phoneCode,
      onError: authParams.onError ?? (() => {}),
    });

    return this.stringSession.save();
  }
}
