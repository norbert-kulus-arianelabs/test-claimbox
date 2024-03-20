import react from "@vitejs/plugin-react";
import fs from "fs";
import { createCA, createCert } from "mkcert";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export const CERT_FILE_PATH = "certs/cert.pem";
export const KEY_FILE_PATH = "certs/key.pem";

if (!fs.existsSync("certs")) {
  fs.mkdirSync("certs");
}

if (!fs.existsSync(CERT_FILE_PATH) || !fs.existsSync(KEY_FILE_PATH)) {
  const ca = await createCA({
    organization: "local",
    countryCode: "local",
    state: "local",
    locality: "local",
    validity: 365,
  });

  const { key, cert } = await createCert({
    domains: ["localhost"],
    validity: 365,
    ca: { key: ca.key, cert: ca.cert },
  });

  fs.writeFileSync(CERT_FILE_PATH, cert);
  fs.writeFileSync(KEY_FILE_PATH, key);
}

export const viteConfig = {
  server: {
    https: {
      key: fs.readFileSync(KEY_FILE_PATH),
      cert: fs.readFileSync(CERT_FILE_PATH),
    },
  },
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      buffer: "buffer",
      "@src": "/src",
    },
  },
  define: {
    "process.env": {},
    global: "window",
  },
  base: "./",
  build: {
    rollupOptions: {
      plugins: [
        commonjs({
          filter(id) {
            if (id.includes("node_modules/hashconnect")) {
              return true;
            }
          },
        }),
      ],
    },
  },
};
