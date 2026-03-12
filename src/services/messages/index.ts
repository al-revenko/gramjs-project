import { TgClient } from "src/lib/tg";
import { ServiceError, UnauthorizedError, UnknownError } from "../errors";
import { TgClientError } from "src/lib/tg/errors";

export class MessagesService {
  constructor(private tgClient: TgClient) {}

  async sendMessage(phoneNumber: string, message: string) {
    const isAuthorized = await this.tgClient.isAuthorized();

    if (!isAuthorized) {
      throw new UnauthorizedError();
    }

    try {
      const user = await this.tgClient.getUser(phoneNumber);

      await this.tgClient.sendMessage(user, message);
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
