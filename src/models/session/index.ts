import fs from "fs/promises";

export class SessionModel {
  constructor(private storePath: string) {}

  async setSession(sessionStr: string) {
    await fs.writeFile(this.storePath, sessionStr, "utf-8");
  }

  async getSession(): Promise<string | null> {
    try {
      const session = await fs.readFile(this.storePath, "utf-8");

      return session || null;
    } catch {
      return null;
    }
  }
}
