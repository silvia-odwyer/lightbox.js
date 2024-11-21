import { defineConfig } from "tsup";
import cssModulesPlugin from "esbuild-css-modules-plugin";
import path from 'path'

const env = process.env.NODE_ENV;

export default defineConfig({
  esbuildPlugins: [cssModulesPlugin()],
  clean: true,
  format: ['cjs', 'esm'], // generate cjs and esm files
  outDir: "dist",
  entryPoints: ['lib/index.ts'],
  target: 'es2020',
  entry: ['lib/**/*.tsx'], //include all files under src

});
