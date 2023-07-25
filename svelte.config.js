// import adapter from "@sveltejs/adapter-vercel";
// adapter: adapter({ runtime: "edge" }),

import adapter from "@sveltejs/adapter-cloudflare";

import { vitePreprocess } from "@sveltejs/kit/vite";
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // See below for an explanation of these options
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
    }),
    inlineStyleThreshold: 5000,
    alias: {
      $components: "src/components",
      $types: "src/lib/types",
      $stores: "src/stores",
    },
  },
  preprocess: vitePreprocess(),
};

export default config;
