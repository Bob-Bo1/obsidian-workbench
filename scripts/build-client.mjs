import { build } from "esbuild";

await build({
  entryPoints: ["lib/client-source.js"],
  outfile: "lib/client.js",
  bundle: true,
  platform: "browser",
  format: "iife",
  external: ["react"],
  legalComments: "none",
  minify: false,
  sourcemap: false,
  target: "es2020"
});
