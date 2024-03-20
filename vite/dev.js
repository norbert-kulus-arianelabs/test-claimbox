import { createServer } from "vite";
import { viteConfig } from './config.js';

(async () => {
  const server = await createServer(viteConfig);
  await server.listen();

  server.printUrls();
})();
