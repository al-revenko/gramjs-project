import { TelegramClient } from "telegram";
import { ApiCredentials } from "telegram/client/auth";
import { TelegramClientParams } from "telegram/client/telegramBaseClient";
import { StringSession } from "telegram/sessions";

export interface AuthUserParams {
  phoneNumber: () => Promise<string>;
  password?: () => Promise<string>;
  phoneCode: () => Promise<string>;
}

export class TgClient {
  private client: TelegramClient | null;
  private stringSession: StringSession | null;

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

    const client = this.client;

    let phone: string = "";

    await client.start({
      phoneNumber: async () => {
        phone = await authParams.phoneNumber();

        return phone;
      },
      password: authParams.password,
      phoneCode: async () => {
        await client.sendCode(this.apiCredentials, phone);

        return authParams.phoneCode();
      },
      onError: (err) => {
        throw err;
      },
    });

    return this.stringSession.save();
  }
}
