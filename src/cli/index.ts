import readline from "readline";
import { AuthController } from "src/controllers/auth";

interface IOParams {
  input: NodeJS.ReadableStream;
  output: NodeJS.WritableStream;
}

export class CLI {
  private view: readline.Interface;

  constructor(
    { input, output }: IOParams,
    private authController: AuthController,
  ) {
    this.view = readline.createInterface({
      input,
      output,
    });
  }

  input(question: string): Promise<string> {
    return new Promise((resolve) => this.view.question(question, resolve));
  }

  authUser(): Promise<void> {
    return this.authController.authUser({
      getPhoneNumber: () => this.input("Please enter your phone number: "),
      getPassword: () => this.input("Please enter your password: "),
      getPhoneCode: () => this.input("Please enter the code you received: "),
      onError: (error) => {
        this.view.write(`${error}\n`);
      },
    });
  }
}
