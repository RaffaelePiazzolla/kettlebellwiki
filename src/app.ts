import express from 'express';
import env from './config/env';
import initApp from './loaders';
import print from './utils/print';

async function main() {

  print.intro();
  print.loading(`starting server on port ${env.website.port}`);

  try {
    const app = express();

    await initApp(app);

    app.listen(env.website.port, () => {
      print(`server started in ${env.mode} mode on port ${env.website.port}`);
    });

  } catch (error: any) {
    print.error(`failed to start server on port ${env.website.port}`, error?.message);
  }

}

main();