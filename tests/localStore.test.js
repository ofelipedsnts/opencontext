import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "openctx-local-"));

const fixture = (name) => resolve("tests", "fixtures", name);

describe("localStore", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    process.env.OPENCTX_CONFIG_DIR = tempDir;
    await mkdir(join(tempDir, "private"), { recursive: true });
    await copyFile(fixture("doc-alpha.md"), join(tempDir, "private", "doc-alpha.md"));
    await copyFile(fixture("doc-beta.md"), join(tempDir, "private", "doc-beta.md"));
    await copyFile(fixture("invalid.md"), join(tempDir, "private", "invalid.md"));
    vi.resetModules();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.OPENCTX_CONFIG_DIR;
  });

  it("lists valid documents", async () => {
    const store = await import("../src/store/localStore.js");
    const docs = await store.list();
    const ids = docs.map((doc) => doc.id).sort();

    expect(ids).toEqual(["doc-alpha", "doc-beta"]);
  });

  it("gets a document by id", async () => {
    const store = await import("../src/store/localStore.js");
    const doc = await store.get("doc-alpha");

    expect(doc.metadata.id).toBe("doc-alpha");
    expect(doc.content).toContain("Alpha content");
  });

  it("checks document existence", async () => {
    const store = await import("../src/store/localStore.js");
    expect(await store.exists("doc-beta")).toBe(true);
    expect(await store.exists("missing")).toBe(false);
  });

  it("adds a document from source", async () => {
    const store = await import("../src/store/localStore.js");
    const id = await store.add(fixture("doc-alpha.md"));
    const doc = await store.get(id);

    expect(id).toBe("doc-alpha");
    expect(doc.metadata.title).toBe("Alpha Doc");
  });

  it("searches by metadata", async () => {
    const store = await import("../src/store/localStore.js");
    const results = await store.search("beta");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("doc-beta");
  });
});
