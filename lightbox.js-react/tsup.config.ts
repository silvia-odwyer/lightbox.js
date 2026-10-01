import { defineConfig } from "tsup";
// import cssModulesPlugin from "esbuild-css-s-plugin";
import cssModulesPlugin from "esbuild-css-modules-plugin";

export default defineConfig((options) => ({
  // Entry points
  entry: ["lib/index.ts"],

  // Output formats
  format: ["cjs", "esm"], // CJS for CRA <5, ESM for modern bundlers

  // External dependencies (not bundled)
  external: ["react", "react/jsx-runtime"],

  esbuildPlugins: [cssModulesPlugin()],

  // TypeScript declarations
  dts: true, 

  // Clean dist folder on build
  clean: true,  

  // Sourcemaps for debugging
  sourcemap: false,  

  // Target modern JS for ESM, slightly older for CJS if needed
  target: "es2017", // safe for CRA <5

  banner: { js: '"use client";' },  

  splitting: false, 

  // minify only for production
  minify: !options.watch,  
}));
