import { defineConfig } from "tsup";
import cssModulesPlugin from "esbuild-css-modules-plugin";
import path from "path";

const env = process.env.NODE_ENV;

// const react18PluginOptions: React18PluginOptions = {
//   keepTests: false,
// };

export default defineConfig({
  clean: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.json"),
  entry: [ "./lib/SlideshowLightbox/SlideshowLightbox.tsx"],
  bundle: false,
  format: ["esm"],
  outDir: "dist",
  esbuildOptions(options, context) {
    options.outbase = "./";
    },
    banner: { js: '"use client";' },

  
});
