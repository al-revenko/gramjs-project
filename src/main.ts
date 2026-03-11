import { App } from "./app";
import { Config, loadEnv } from "./lib/config";

function main() {
  loadEnv();

  const cfg = new Config();
}

main();
