import { mkdir, copyFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import matter from "gray-matter";

import * as localStore from "../store/localStore.js";
import { getContentDir } from "../utils/paths.js";
import { info, success, warn } from "../utils/logger.js";

const ensureFrontmatter = (metadata) => {
  if (!metadata?.id || !metadata?.title) {
    throw new Error("Missing required frontmatter fields: id and title");
  }
};

const addToTeam = async (sourcePath, id) => {
  const raw = await readFile(sourcePath, "utf8");
  const parsed = matter(raw);
  ensureFrontmatter(parsed.data);

  if (id && parsed.data.id && id !== parsed.data.id) {
    throw new Error("Provided id does not match frontmatter id");
  }

  const targetId = id ?? parsed.data.id;
  const targetPath = join(getContentDir(), `${targetId}.md`);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
  return targetId;
};

const register = (program) => {
  program
    .command("add")
    .description("Add a documentation file to the store")
    .argument("<path>", "Path to a markdown file")
    .option("--team", "Add to repository content directory")
    .action(async (pathArg, options) => {
      try {
        const id = options.team
          ? await addToTeam(pathArg)
          : await localStore.add(pathArg);
        success(`Added ${id}`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
