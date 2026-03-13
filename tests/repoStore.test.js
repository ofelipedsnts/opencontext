import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "openctx-repo-"));

const fixture = (name) => resolve("tests", "fixtures", name);

describe("repoStore", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    await mkdir(join(tempDir, "content"), { recursive: true });
    await copyFile(fixture("doc-alpha.md"), join(tempDir, "content", "doc-alpha.md"));
    await copyFile(fixture("doc-beta.md"), join(tempDir, "content", "doc-beta.md"));
    await copyFile(fixture("invalid.md"), join(tempDir, "content", "invalid.md"));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    vi.resetModules();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  it("lists valid documents", async () => {
    const store = await import("../src/store/repoStore.js");
    const docs = await store.list();
    const ids = docs.map((doc) => doc.id).sort();

    expect(ids).toEqual(["doc-alpha", "doc-beta"]);
  });

  it("gets a document by id", async () => {
    const store = await import("../src/store/repoStore.js");
    const doc = await store.get("doc-beta");

    expect(doc.metadata.id).toBe("doc-beta");
    expect(doc.content).toContain("Beta content");
  });

  it("checks document existence", async () => {
    const store = await import("../src/store/repoStore.js");
    expect(await store.exists("doc-alpha")).toBe(true);
    expect(await store.exists("missing")).toBe(false);
  });

  it("searches by metadata", async () => {
    const store = await import("../src/store/repoStore.js");
    const results = await store.search("alpha");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("doc-alpha");
  });
});
