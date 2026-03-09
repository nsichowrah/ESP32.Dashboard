import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const fallbackRepoName = "ESP.Dashboard";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || fallbackRepoName;

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${repositoryName}/` : "/"
}));
