// Run normal npm scripts without network or generated files outside tests/.
// Build in an exact source/config copy; keep dependency resolution on installed packages.
import { cp, mkdir, mkdtemp, readdir, rm, symlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));
const task = process.argv[2];
if (!["prebuild", "lint", "build"].includes(task)) throw new Error("Choose prebuild, lint or build");
const scratch = await mkdtemp(path.join(root, "tests/.offline-check-"));
const env = {
  PATH: process.env.PATH,
  NEXT_TELEMETRY_DISABLED: "1",
  npm_config_cache: path.join(scratch, "npm-cache"),
  npm_config_update_notifier: "false",
  TMPDIR: path.join(scratch, "tmp"),
  XDG_CACHE_HOME: path.join(scratch, "cache"),
  NODE_OPTIONS: `--import=${path.join(root, "tests/helpers/offline-runtime.mjs")}`,
  NEXT_FONT_GOOGLE_MOCKED_RESPONSES: path.join(root, "tests/helpers/offline-fonts.cjs"),
};
await mkdir(env.TMPDIR);
try {
  let cwd = root;
  if (task === "build") {
    cwd = path.join(scratch, "project");
    await mkdir(cwd);
    for (const entry of ["src", "public", "scripts", "package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "next.config.ts", "postcss.config.mjs", "eslint.config.mjs"]) {
      await cp(path.join(root, entry), path.join(cwd, entry), { recursive: true });
    }
    await mkdir(path.join(cwd, "tests"));
    for (const entry of await readdir(path.join(root, "tests"))) {
      if (!entry.startsWith(".offline-check-")) await cp(path.join(root, "tests", entry), path.join(cwd, "tests", entry), { recursive: true });
    }
    await symlink(path.join(root, "node_modules"), path.join(cwd, "node_modules"), "dir");
  }
  const code = await new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", task, ...(task === "build" && process.argv.includes("--webpack") ? ["--", "--webpack"] : [])], { cwd, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
  process.exitCode = code;
} finally {
  await rm(scratch, { recursive: true, force: true });
}
