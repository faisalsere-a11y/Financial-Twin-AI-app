import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const apiPath = join(root, "app", "api");
const apiBackupPath = join(root, ".api.__github_pages_backup__");
const outPath = join(root, "out");
const docsPath = join(root, "docs");
const buildCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const buildArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd run build"] : ["run", "build"];

async function restoreApi() {
  if (existsSync(apiBackupPath) && !existsSync(apiPath)) {
    await rename(apiBackupPath, apiPath);
  }
}

if (existsSync(apiBackupPath)) {
  throw new Error(`Refusing to continue because ${apiBackupPath} already exists.`);
}

try {
  if (existsSync(apiPath)) {
    await rename(apiPath, apiBackupPath);
  }

  const result = spawnSync(buildCommand, buildArgs, {
    cwd: root,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_GITHUB_PAGES: "true",
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "github-pages-static-demo-secret",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "https://faisalsere-a11y.github.io/Financial-Twin-AI-app"
    },
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`GitHub Pages build failed with exit code ${result.status}: ${result.error?.message ?? "no spawn error"}`);
  }

  await rm(docsPath, { recursive: true, force: true });
  await mkdir(docsPath, { recursive: true });
  await cp(outPath, docsPath, { recursive: true });
  await writeFile(join(docsPath, ".nojekyll"), "");
} finally {
  await restoreApi();
}
