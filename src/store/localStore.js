import { getPrivateDir } from "../utils/paths.js";
import {
  findDocsById,
  listDocs,
  searchDocs,
  selectDocVariant
} from "./contentUtils.js";

const exists = async (id) => {
  try {
    const docs = await findDocsById(getPrivateDir(), id);
    return docs.length > 0;
  } catch {
    return false;
  }
};

const get = async (id, options = {}) => {
  const docs = await findDocsById(getPrivateDir(), id);
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

const list = async () => listDocs(getPrivateDir());

const add = async () => {
  throw new Error("localStore.add is not supported; use opencontext add");
};

const search = async (query) => searchDocs(getPrivateDir(), query);

export { exists, get, list, add, search };
