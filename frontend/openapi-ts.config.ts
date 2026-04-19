import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../openapi-schema.json",
  output: "src/client",
  postProcess: ["prettier"],
  plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
});
