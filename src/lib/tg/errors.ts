import { RPCError } from "telegram/errors";

export interface TgClientErrorOptions extends ErrorOptions {
  statusCode: number;
  message: string;
}

export class TgClientError extends Error {
  statusCode: number;

  constructor({ message, statusCode, cause }: TgClientErrorOptions) {
    super(message, { cause });
    this.statusCode = statusCode;
  }
}

export class TgClientNotInitError extends TgClientError {
  constructor({
    message,
    statusCode,
    cause,
  }: Partial<TgClientErrorOptions> = {}) {
    super({
      message: message ?? "TG_CLIENT_NOT_INITIALIZED",
      statusCode: statusCode ?? 500,
      cause,
    });
  }
}

export function wrapToTgClientError(error: unknown): TgClientError {
  let msg: string = "TG_CLIENT_UNKNOWN_ERR";
  let code: number = 500;

  if (error instanceof Error) {
    msg = error.message;
  }

  if (error instanceof RPCError) {
    msg = error.errorMessage;
    code = error.code ?? code;
  }

  return new TgClientError({ message: msg, statusCode: code, cause: error });
}
