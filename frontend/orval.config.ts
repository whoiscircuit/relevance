import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://localhost:3000/docs/json", // Reads directly from your running backend
    output: {
      mode: "tags-split", // Generates a separate file for each Controller (e.g. users.ts, posts.ts)
      target: "src/api/endpoints",
      schemas: "src/api/model",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/lib/axios.ts", // Use the custom instance we just made
          name: "customInstance",
        },
      },
    },
  },
});
