import { defineConfig } from "father";

export default defineConfig({
  extends: "../../.fatherrc.ts",
  sourcemap: process.env.NODE_ENV === "production" ? false : true,
});
