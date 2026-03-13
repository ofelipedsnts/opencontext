import { mkdir, access, readFile, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";

import { glob } from "glob";
import matter from "gray-matter";
import Fuse from "fuse.js";

import { getPrivateDir } from "../utils/paths.js";

const getDocPath = (id) => join(getPrivateDir(), `${id}.md`);

const ensureFrontmatter = (metadata) => {
  if (!metadata?.id || !metadata?.title) {
    throw new Error("Missing required frontmatter fields: id and title");
  }
};

const exists = async (id) => {
  try {
    await access(getDocPath(id), constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const get = async (id) => {
  const filePath = getDocPath(id);
  const file = await readFile(filePath, "utf8");
  const parsed = matter(file);
  ensureFrontmatter(parsed.data);

  return { metadata: parsed.data, content: parsed.content };
};

const list = async () => {
  const dir = getPrivateDir();
  const files = await glob("**/*.md", { cwd: dir, nodir: true });

  const docs = [];
  for (const file of files) {
    const raw = await readFile(join(dir, file), "utf8");
    const parsed = matter(raw);
    if (!parsed.data?.id || !parsed.data?.title) {
      continue;
    }
    docs.push(parsed.data);
  }

  return docs;
};

const add = async (sourcePath, id) => {
  const raw = await readFile(sourcePath, "utf8");
  const parsed = matter(raw);
  ensureFrontmatter(parsed.data);

  if (id && parsed.data.id && id !== parsed.data.id) {
    throw new Error("Provided id does not match frontmatter id");
  }

  const targetId = id ?? parsed.data.id;
  const targetPath = getDocPath(targetId);

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);

  return targetId;
};

const search = async (query) => {
  const docs = await list();
  const fuse = new Fuse(docs, {
    keys: ["title", "description", "tags"],
    threshold: 0.35
  });

  return fuse.search(query).map((result) => result.item);
};

export { exists, get, list, add, search };
