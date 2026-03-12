import type { Response } from "express";
import { ZodError } from "zod";
import { ServiceError } from "src/services/errors";

export interface AppResponse<Content extends Record<string, unknown>> {
  statusCode: number;
  content: {
    success: boolean;
  } & Content;
}

export type AppErrResponse = AppResponse<{
  success: false;
  error: string | string[];
}>;

export function sendResponse<Content extends Record<string, unknown>>(
  res: Response,
  code: number,
  content?: Content,
): void {
  const success = code < 400 ? true : false;

  res.status(code).json({
    success,
    ...content,
  });
}

export function getErrResponse(err: unknown): AppErrResponse {
  const internalErrResponse: AppErrResponse = {
    statusCode: 500,
    content: {
      success: false,
      error: "INTERNAL_ERROR",
    },
  };

  if (!(err instanceof Error)) {
    return internalErrResponse;
  }

  if (err instanceof ZodError) {
    if (err.issues.length === 0) {
      return {
        statusCode: 400,
        content: {
          success: false,
          error: "BAD_REQUEST",
        },
      };
    }

    if (err.issues.length === 1) {
      return {
        statusCode: 400,
        content: {
          success: false,
          error: err.issues[0].message,
        },
      };
    }

    return {
      statusCode: 400,
      content: {
        success: false,
        error: err.issues.map((iss) => iss.message),
      },
    };
  }

  if (err instanceof ServiceError) {
    if (err.statusCode >= 500) {
      return internalErrResponse;
    }

    return {
      statusCode: err.statusCode,
      content: {
        success: false,
        error: err.message,
      },
    };
  }

  return internalErrResponse;
}
