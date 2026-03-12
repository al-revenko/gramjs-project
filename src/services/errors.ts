export interface ServiceErrorOptions extends ErrorOptions {
  statusCode: number;
}

export class ServiceError extends Error {
  statusCode: number;

  constructor(message: string, options: ServiceErrorOptions) {
    super(message, options);

    this.statusCode = options?.statusCode;
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(option?: ErrorOptions) {
    super("UNAUTHORIZED", { statusCode: 401, cause: option?.cause });
  }
}

export class NotFoundError extends ServiceError {
  constructor(option?: ErrorOptions) {
    super("NOT_FOUND", { statusCode: 404, cause: option?.cause });
  }
}

export class UnknownError extends ServiceError {
  constructor(option?: ErrorOptions) {
    super("UNKNOWN_ERROR", { statusCode: 500, cause: option?.cause });
  }
}
