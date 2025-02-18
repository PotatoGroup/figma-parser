import { defineConfig } from 'father'

export default defineConfig({
  define: {
    VERSION: JSON.stringify(process.env.npm_package_version),
  },
  esm: {
    output: "esm",
  },
  cjs: {
    output: "lib",
  },
  platform: "browser",
});
