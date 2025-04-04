//cypress.config.ts
import { defineConfig } from "cypress";
import webpackConfig from "./webpack.config";
export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig,
    },
    setupNodeEvents(on, config) {
     
    },
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
     
    },
  },
});