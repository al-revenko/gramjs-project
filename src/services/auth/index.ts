import { TgClient } from "src/lib/tg";
import { TgClientError } from "src/lib/tg/errors";
import { SessionModel } from "src/models/session";
import { ServiceError, UnknownError } from "../errors";

export class AuthService {
  constructor(
    private client: TgClient,
    private sessionModel: SessionModel,
  ) {}

  async isAuthorized() {
    try {
      return this.client.isAuthorized();
    } catch (err) {
      throw new UnknownError({ cause: err });
    }
  }

  async authUser(authParams: {
    phoneNumber: () => Promise<string>;
    password?: () => Promise<string>;
    phoneCode: () => Promise<string>;
    onTgError?: (err: Error) => void;
  }) {
    try {
      const sessionStr = await this.client.authUser({
        phoneNumber: authParams.phoneNumber,
        password: authParams.password,
        phoneCode: authParams.phoneCode,
        onError: authParams.onTgError,
      });

      await this.sessionModel.setSession(sessionStr);
    } catch (err) {
      if (err instanceof TgClientError) {
        throw new ServiceError(err.message, {
          cause: err,
          statusCode: err.statusCode,
        });
      }

      throw new UnknownError({ cause: err });
    }
  }
}
