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
      onTgError: (error) => {
        // NOTE: gramjs выбрасывает ошибку "Code is empty" в случае когда предоставленный код пустой
        // либо когда внутри коллбэка произошла ошибка (в этом случае "Code is empty" будет некорректным сообщением)
        // обрабатываем эту ошибку отдельно и выдаём более понятное сообщение
        if (error.message.startsWith("Code is empty")) {
          this.view.write(`Invalid code, please try again.\n`);
          return;
        }

        this.view.write(`${error.message}\n`);
      },
    });
  }
}
