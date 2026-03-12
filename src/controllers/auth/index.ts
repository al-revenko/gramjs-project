import z from "zod";
import type { Express, Handler } from "express";
import { TgClient } from "src/lib/tg";
import { SessionModel } from "src/models/session";
import { AuthService } from "src/services/auth";
import { getErrResponse, sendResponse } from "src/lib/api";

interface AuthParams {
  getPhoneNumber: () => Promise<string>;
  getPassword?: () => Promise<string>;
  getPhoneCode: () => Promise<string>;
  onTgError?: (error: Error) => void;
}

export class AuthController {
  private authService: AuthService;

  constructor(
    express: Express,
    tgClient: TgClient,
    sessionModel: SessionModel,
  ) {
    this.authService = new AuthService(tgClient, sessionModel);

    this.setupRoutes(express);
  }

  private setupRoutes(router: Express) {
    router.get("/auth/status", this.authStatusHandler);
  }

  private authStatusHandler: Handler = async (req, res) => {
    try {
      const isAuthorized = await this.authService.isAuthorized();

      return sendResponse(res, 200, { authorized: isAuthorized });
    } catch (err) {
      const { statusCode, content } = getErrResponse(err);

      if (statusCode >= 500) {
        console.error(err);
      }

      return sendResponse(res, statusCode, content);
    }
  };

  async authUser({
    getPhoneNumber,
    getPassword,
    getPhoneCode,
    onTgError,
  }: AuthParams) {
    const phoneNumberCb = async () => {
      const phoneNumber = await getPhoneNumber();

      const result = await z.e164().safeParseAsync(phoneNumber);
      if (result.success) {
        return result.data;
      }

      throw new Error("Invalid phone number format", { cause: result.error });
    };

    const passwordCb = async () => {
      if (!getPassword) {
        return "";
      }

      const password = await getPassword();

      const result = await z.string().min(1).safeParseAsync(password);
      if (result.success) {
        return result.data;
      }

      throw new Error("Password is empty", { cause: result.error });
    };

    const phoneCodeCb = async () => {
      const phoneCode = await getPhoneCode();

      const result = await z.string().length(5).safeParseAsync(phoneCode);
      if (result.success && !Number.isNaN(Number(phoneCode))) {
        return result.data;
      }

      throw new Error("Invalid phone code", { cause: result.error });
    };

    await this.authService.authUser({
      phoneNumber: phoneNumberCb,
      password: getPassword && passwordCb,
      phoneCode: phoneCodeCb,
      onTgError,
    });
  }
}
