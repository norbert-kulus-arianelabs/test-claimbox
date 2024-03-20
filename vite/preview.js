import { preview } from "vite";
import { viteConfig } from "./config.js";

(async () => {
  const previewServer = await preview({
    ...viteConfig,
    preview: {
      port: 8080,
      open: true,
    },
  });

  previewServer.printUrls();
})();
