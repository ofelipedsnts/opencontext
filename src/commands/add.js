import { mkdir, copyFile, readFile } from "node:fs/promises";
import { basename, dirname, join, normalize, sep } from "node:path";

import matter from "gray-matter";

import { getContentDir, getPrivateDir } from "../utils/paths.js";
import { warn, success } from "../utils/logger.js";

const DOC_FILE = "DOC.md";
const SKILL_FILE = "SKILL.md";

const ensureDocFrontmatter = (data) => {
  const metadata = data?.metadata ?? {};
  if (!data?.name || !data?.description) {
    throw new Error("Missing required frontmatter fields: name and description");
  }
  if (!metadata.languages || !metadata.versions || metadata.revision === undefined) {
    throw new Error(
      "Missing required frontmatter metadata: languages, versions, revision"
    );
  }
  if (!metadata["updated-on"] || !metadata.source) {
    throw new Error("Missing required frontmatter metadata: updated-on, source");
  }
};

const ensureSkillFrontmatter = (data) => {
  const metadata = data?.metadata ?? {};
  if (!data?.name || !data?.description) {
    throw new Error("Missing required frontmatter fields: name and description");
  }
  if (metadata.revision === undefined || !metadata["updated-on"] || !metadata.source) {
    throw new Error("Missing required frontmatter metadata: revision, updated-on, source");
  }
};

const detectContentPath = (sourcePath) => {
  const normalized = normalize(sourcePath);
  const parts = normalized.split(sep);
  const docsIndex = parts.lastIndexOf("docs");
  const skillsIndex = parts.lastIndexOf("skills");

  const index = docsIndex > skillsIndex ? docsIndex : skillsIndex;
  if (index === -1) {
    throw new Error("Path must include a /docs/ or /skills/ segment");
  }

  const type = index === docsIndex ? "docs" : "skills";
  if (index === 0) {
    throw new Error("Path must include an author segment before docs/skills");
  }

  const author = parts[index - 1];
  const relativeParts = parts.slice(index - 1);
  const fileName = basename(sourcePath);
  if (type === "docs" && fileName !== DOC_FILE) {
    throw new Error("DOC files must be named DOC.md");
  }
  if (type === "skills" && fileName !== SKILL_FILE) {
    throw new Error("Skill files must be named SKILL.md");
  }

  const entryName = parts[index + 1];
  if (!entryName) {
    throw new Error("Entry name directory is required after docs/skills");
  }

  return {
    type,
    author,
    entryName,
    relativePath: relativeParts.join(sep)
  };
};

const addContent = async (sourcePath, baseDir) => {
  const raw = await readFile(sourcePath, "utf8");
  const parsed = matter(raw);
  const contentPath = detectContentPath(sourcePath);

  if (contentPath.type === "docs") {
    ensureDocFrontmatter(parsed.data);
  } else {
    ensureSkillFrontmatter(parsed.data);
  }

  if (parsed.data?.name && parsed.data.name !== contentPath.entryName) {
    throw new Error("Frontmatter name must match entry directory name");
  }

  const targetPath = join(baseDir, contentPath.relativePath);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);

  return {
    id: `${contentPath.author}/${contentPath.entryName}`,
    type: contentPath.type
  };
};

const register = (program) => {
  program
    .command("add")
    .description("Add a DOC.md or SKILL.md file to the store")
    .argument("<path>", "Path to a markdown file")
    .option("--team", "Add to repository content directory")
    .action(async (pathArg, options) => {
      try {
        const baseDir = options.team ? getContentDir() : getPrivateDir();
        const result = await addContent(pathArg, baseDir);
        const label = result.type === "skills" ? "skill" : "doc";
        success(`Added ${label} ${result.id}`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
