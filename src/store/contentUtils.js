import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { glob } from "glob";
import matter from "gray-matter";
import Fuse from "fuse.js";

const DOC_FILE = "DOC.md";

const splitPath = (filePath) => filePath.split(/[/\\]/);

const parseTags = (tags) => {
  if (!tags) {
    return [];
  }
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const requiredDocFields = [
  "name",
  "description",
  "metadata.languages",
  "metadata.versions",
  "metadata.revision",
  "metadata.updated-on",
  "metadata.source"
];

const hasRequiredFields = (data) => {
  if (!data?.name || !data?.description) {
    return false;
  }
  const metadata = data.metadata ?? {};
  return Boolean(
    metadata.languages &&
      metadata.versions &&
      metadata.revision !== undefined &&
      metadata["updated-on"] &&
      metadata.source
  );
};

const compareVersions = (a, b) => {
  if (a === b) {
    return 0;
  }
  const parse = (value) =>
    value
      .split(".")
      .map((part) => Number.parseInt(part.replace(/\D+/g, ""), 10) || 0);
  const partsA = parse(String(a));
  const partsB = parse(String(b));
  const length = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return String(a).localeCompare(String(b));
};

const parseDocPath = (relativePath) => {
  const parts = splitPath(relativePath);
  if (parts.length < 4) {
    return null;
  }
  const [author, kind, entryName] = parts;
  if (kind !== "docs") {
    return null;
  }
  if (parts[parts.length - 1] !== DOC_FILE) {
    return null;
  }
  return { author, entryName };
};

const readDoc = async (baseDir, relativePath) => {
  const pathInfo = parseDocPath(relativePath);
  if (!pathInfo) {
    return null;
  }

  const filePath = join(baseDir, relativePath);
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);
  if (!hasRequiredFields(parsed.data)) {
    return null;
  }

  const metadata = parsed.data.metadata ?? {};
  const tags = parseTags(metadata.tags);
  const id = `${pathInfo.author}/${parsed.data.name}`;

  return {
    id,
    author: pathInfo.author,
    name: parsed.data.name,
    description: parsed.data.description,
    metadata: {
      languages: metadata.languages,
      versions: metadata.versions,
      revision: metadata.revision,
      "updated-on": metadata["updated-on"],
      source: metadata.source,
      tags
    },
    content: parsed.content,
    filePath
  };
};

const listDocs = async (baseDir) => {
  const files = await glob("**/docs/**/DOC.md", { cwd: baseDir, nodir: true });
  const docs = [];
  for (const file of files) {
    const doc = await readDoc(baseDir, file);
    if (doc) {
      docs.push(doc);
    }
  }
  return docs;
};

const findDocsById = async (baseDir, id) => {
  const [author, ...nameParts] = id.split("/");
  if (!author || nameParts.length === 0) {
    throw new Error("Document id must be in the format <author>/<name>");
  }
  const namePath = nameParts.join("/");
  const pattern = join(author, "docs", namePath, "**", DOC_FILE).replace(/\\/g, "/");
  const files = await glob(pattern, { cwd: baseDir, nodir: true });
  const docs = [];
  for (const file of files) {
    const doc = await readDoc(baseDir, file);
    if (doc && doc.name === namePath) {
      docs.push(doc);
    }
  }
  return docs;
};

const selectDocVariant = (docs, options = {}) => {
  if (docs.length === 0) {
    return null;
  }

  let filtered = docs;

  if (options.version) {
    filtered = filtered.filter((doc) => doc.metadata.versions === options.version);
    if (filtered.length === 0) {
      const available = [...new Set(docs.map((doc) => doc.metadata.versions))].sort(
        compareVersions
      );
      throw new Error(`Version not found. Available versions: ${available.join(", ")}`);
    }
  }

  if (options.lang) {
    filtered = filtered.filter((doc) => doc.metadata.languages === options.lang);
    if (filtered.length === 0) {
      const available = [...new Set(docs.map((doc) => doc.metadata.languages))].sort();
      throw new Error(`Language not found. Available languages: ${available.join(", ")}`);
    }
  }

  filtered.sort((a, b) => {
    const versionCompare = compareVersions(a.metadata.versions, b.metadata.versions);
    if (versionCompare !== 0) {
      return versionCompare;
    }
    return (b.metadata.revision ?? 0) - (a.metadata.revision ?? 0);
  });

  return filtered[filtered.length - 1];
};

const searchDocs = async (baseDir, query) => {
  const docs = await listDocs(baseDir);
  const fuse = new Fuse(docs, {
    keys: ["name", "description", "metadata.tags", "id"],
    threshold: 0.35
  });
  return fuse.search(query).map((result) => result.item);
};

export {
  requiredDocFields,
  listDocs,
  findDocsById,
  selectDocVariant,
  searchDocs,
  parseTags,
  hasRequiredFields
};
