import readline from "readline";

export class CLI {
  private view: readline.Interface;

  constructor(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
    this.view = readline.createInterface({
      input,
      output,
    });
  }

  inputPhone(): Promise<string> {
    return new Promise((resolve) =>
      this.view.question("Please enter your phone number: ", resolve),
    );
  }

  inputPassword(): Promise<string> {
    return new Promise((resolve) =>
      this.view.question("Please enter your password: ", resolve),
    );
  }

  inputPhoneCode(): Promise<string> {
    return new Promise((resolve) =>
      this.view.question("Please enter the code you received: ", resolve),
    );
  }
}
