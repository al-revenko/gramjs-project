import { TgClient } from "src/lib/tg";
import { SessionModel } from "src/models/session";

export class AuthService {
  constructor(
    private client: TgClient,
    private sessionModel: SessionModel,
  ) {}

  async isAuthorized() {
    return this.client.isAuthorized();
  }

  async authUser(authParams: {
    phoneNumber: () => Promise<string>;
    password?: () => Promise<string>;
    phoneCode: () => Promise<string>;
    onError?: (err: Error) => void;
  }) {
    const sessionStr = await this.client.authUser({
      phoneNumber: authParams.phoneNumber,
      password: authParams.password,
      phoneCode: authParams.phoneCode,
      onError: authParams.onError,
    });

    await this.sessionModel.setSession(sessionStr);
  }
}
