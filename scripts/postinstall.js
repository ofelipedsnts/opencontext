import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const baseDir = join(homedir(), ".config", "opencontext");
const dirs = ["private", "annotations", "cache"].map((dir) =>
  join(baseDir, dir)
);

const message = (text) => {
  process.stdout.write(`${text}\n`);
};

const errorMessage = (text) => {
  process.stderr.write(`${text}\n`);
};

try {
  await mkdir(baseDir, { recursive: true });
  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  message("OpenContext: local directories ready.");
  message("Next steps: run `opencontext init` to create config.json.");
} catch (error) {
  errorMessage("OpenContext: failed to create config directories.");
  errorMessage(error?.message ?? String(error));
  if (error?.code === "EACCES") {
    errorMessage("Permission denied while creating ~/.config/opencontext.");
  }
  errorMessage(
    "You can create them manually at ~/.config/opencontext/{private,annotations,cache}."
  );
  process.exitCode = 1;
}
