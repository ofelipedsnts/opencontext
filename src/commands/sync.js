import { execa } from "execa";

import { getConfig, setConfig } from "../utils/config.js";
import { warn, success } from "../utils/logger.js";

const ensureGitRepo = async () => {
  try {
    await execa("git", ["rev-parse", "--is-inside-work-tree"]);
  } catch {
    throw new Error("Not a git repository");
  }
};

const runInit = async (remoteUrl) => {
  await ensureGitRepo();
  setConfig("sync.enabled", true);
  setConfig("sync.remote", remoteUrl);
  setConfig("sync.branch", "main");
  success("Sync configured.");
};

const runPull = async () => {
  await ensureGitRepo();
  const config = getConfig();
  if (!config.sync?.remote) {
    throw new Error("Sync remote not configured");
  }
  await execa("git", ["pull", config.sync.remote, config.sync.branch], { stdio: "inherit" });
};

const runPush = async () => {
  await ensureGitRepo();
  const config = getConfig();
  if (!config.sync?.remote) {
    throw new Error("Sync remote not configured");
  }
  await execa("git", ["push", config.sync.remote, config.sync.branch], { stdio: "inherit" });
};

const register = (program) => {
  const sync = program.command("sync").description("Sync team repository");

  sync
    .command("init")
    .argument("<git-url>", "Remote git URL")
    .action(async (gitUrl) => {
      try {
        await runInit(gitUrl);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });

  sync
    .command("pull")
    .action(async () => {
      try {
        await runPull();
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });

  sync
    .command("push")
    .action(async () => {
      try {
        await runPush();
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
