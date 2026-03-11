import { App } from "./app";
import { Config, loadEnv } from "./lib/config";

function main() {
  loadEnv(true);

  const cfg = new Config();

  const app = new App({
    telegram: {
      apiId: cfg.TG_API_ID,
      apiHash: cfg.TG_API_HASH,
    },
    session: {
      storePath: cfg.SESSION_STORE_PATH,
    },
  });

  function close() {
    app.close().then(() => {
      process.exit(0);
    });
  }

  app.run(cfg.PORT).then(() => {
    process.on("SIGINT", close);
    process.on("SIGTERM", close);
  });
}

main();
