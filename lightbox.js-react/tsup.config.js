import { defineConfig } from "tsup";
import cssModulesPlugin from "esbuild-css-modules-plugin";
const env = process.env.NODE_ENV;
export default defineConfig({
    esbuildPlugins: [cssModulesPlugin()],
    clean: true,
    format: ['cjs', 'esm'],
    outDir: "dist",
    entryPoints: ['lib/index.ts'],
    target: 'es2020',
    entry: ['lib/**/*.tsx'], //include all files under src
});
