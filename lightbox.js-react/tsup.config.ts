import { defineConfig } from "tsup";
// import cssModulesPlugin from "esbuild-css-s-plugin";
import cssModulesPlugin from "esbuild-css-modules-plugin";

export default defineConfig((options) => ({
  entry: ["lib/index.ts", "lib/**/*.ts", "lib/**/*.tsx"],
  format: ["cjs", "esm"],
  esbuildPlugins: [
    cssModulesPlugin()
  ],
  dts: true,
  clean: true,
  // bundle: false,
  sourcemap: true,
  // splitting: false, 
  // "loader": {
  //   ".css": "copy"
  // },
  target: "es2022",
  external: ["react", "react/jsx-runtime"],
  // minify: !options.watch,
  banner: { js: '"use client";' },
}));
