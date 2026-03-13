import { getContentDir } from "../utils/paths.js";
import {
  findDocsById,
  listDocs,
  searchDocs,
  selectDocVariant
} from "./contentUtils.js";

const exists = async (id) => {
  try {
    const docs = await findDocsById(getContentDir(), id);
    return docs.length > 0;
  } catch {
    return false;
  }
};

const get = async (id, options = {}) => {
  const docs = await findDocsById(getContentDir(), id);
  if (docs.length === 0) {
    throw new Error(`Document not found: ${id}`);
  }
  const selected = selectDocVariant(docs, options);
  if (!selected) {
    throw new Error(`Document not found: ${id}`);
  }
  const { content, ...metadata } = selected;
  return { metadata, content };
};

const list = async () => listDocs(getContentDir());

const add = async () => {
  throw new Error("repoStore.add is not supported");
};

const search = async (query) => searchDocs(getContentDir(), query);

export { exists, get, list, add, search };
