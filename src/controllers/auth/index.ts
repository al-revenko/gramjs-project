import { TgClient } from "src/lib/tg";
import { SessionModel } from "src/models/session";
import { AuthService } from "src/services/auth";
import type { Express, Handler } from "express";
import z from "zod";

interface AuthParams {
  getPhoneNumber: () => Promise<string>;
  getPassword?: () => Promise<string>;
  getPhoneCode: () => Promise<string>;
  onError?: (error: Error) => void;
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

      res.status(200).json({ authorized: isAuthorized });
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: "Failed to check authorization status" });
    }
  };

  async authUser({
    getPhoneNumber,
    getPassword,
    getPhoneCode,
    onError,
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
      onError,
    });
  }
}
