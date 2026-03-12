import type { Express, Handler, Request } from "express";
import { TgClient } from "src/lib/tg";
import { MessagesService } from "src/services/messages";
import { SendMessageDto, SendMessageDtoType } from "./dto";
import { getErrResponse, sendResponse } from "src/lib/api";

export class MessagesController {
  private messagesService: MessagesService;

  constructor(express: Express, tgClient: TgClient) {
    this.messagesService = new MessagesService(tgClient);

    this.setupRoutes(express);
  }

  private setupRoutes(router: Express) {
    router.post("/messages/send", this.sendMessageHandler);
  }

  private sendMessageHandler: Handler = async (
    req: Request<{}, {}, SendMessageDtoType>,
    res,
  ) => {
    const body = req.body;

    const result = SendMessageDto.safeParse(body);

    if (!result.success) {
      const { statusCode, content } = getErrResponse(result.error);

      return sendResponse(res, statusCode, { error: content.error });
    }

    const { phone, message } = result.data;

    try {
      await this.messagesService.sendMessage(phone, message);

      return sendResponse(res, 200, { sentTo: phone });
    } catch (err) {
      const { statusCode, content } = getErrResponse(err);

      if (statusCode >= 500) {
        console.error(err);
      }

      return sendResponse(res, statusCode, content);
    }
  };
}
