import { configDotenv } from "dotenv";
import path from "path";

export class Config {
  readonly PORT: number;
  readonly TG_API_ID: number;
  readonly TG_API_HASH: string;
  readonly SESSION_STORE_PATH: string;

  constructor() {
    const PORT = +(process.env.PORT ?? "");
    const TG_API_ID = +(process.env.TG_API_ID ?? "");
    const TG_API_HASH = process.env.TG_API_HASH ?? "";
    const SESSION_STORE_PATH = process.env.SESSION_STORE_PATH ?? "";

    if (Number.isNaN(this.PORT) || this.PORT === 0) {
      throw new Error(`Invalid PORT env: ${process.env.PORT}`);
    }

    if (Number.isNaN(this.TG_API_ID) || this.TG_API_ID === 0) {
      throw new Error("Invalid TG_API_ID env");
    }

    if (this.TG_API_HASH === "") {
      throw new Error("Empty TG_API_HASH env");
    }

    if (this.SESSION_STORE_PATH === "") {
      throw new Error("Empty SESSION_FILENAME env");
    }

    this.PORT = PORT;
    this.TG_API_ID = TG_API_ID;
    this.TG_API_HASH = TG_API_HASH;
    this.SESSION_STORE_PATH = path.resolve(
      import.meta.dirname,
      "../../..",
      SESSION_STORE_PATH,
    );
  }
}

export function loadEnv(quiet: boolean = false) {
  const res = configDotenv({
    quiet,
  });
  if (res.error) {
    throw res.error;
  }
}
