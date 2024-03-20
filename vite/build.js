import { viteConfig } from "./config.js";
import path from "path";
import { fileURLToPath } from "url";
import { build } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

(async () => {
  await build({
    ...viteConfig,
    server: undefined,
    root: path.resolve(__dirname, "./../"),
  });
})();
