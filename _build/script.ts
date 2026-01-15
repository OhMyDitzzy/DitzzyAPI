import { rmSync } from "node:fs";
import { build as viteBuild } from "vite";
import { build as esBuild } from "esbuild";

async function buildAll() {
  rmSync("dist", { recursive: true, force: true });

  console.info("[INFO] Building client...");
  await viteBuild();

  console.info("[INFO] Building server...");
  await esBuild({
    entryPoints: ["src/server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    logLevel: "info"
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});