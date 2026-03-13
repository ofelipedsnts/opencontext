import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "opencontext-repo-"));

const fixture = (name) => resolve("tests", "fixtures", name);

describe("repoStore", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    await mkdir(join(tempDir, "content", "acme", "docs", "alpha"), { recursive: true });
    await mkdir(join(tempDir, "content", "acme", "docs", "beta"), { recursive: true });
    await mkdir(join(tempDir, "content", "acme", "docs", "invalid"), { recursive: true });
    await copyFile(
      fixture("acme/docs/alpha/DOC.md"),
      join(tempDir, "content", "acme", "docs", "alpha", "DOC.md")
    );
    await copyFile(
      fixture("acme/docs/beta/DOC.md"),
      join(tempDir, "content", "acme", "docs", "beta", "DOC.md")
    );
    await copyFile(
      fixture("acme/docs/invalid/DOC.md"),
      join(tempDir, "content", "acme", "docs", "invalid", "DOC.md")
    );
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

    expect(ids).toEqual(["acme/alpha", "acme/beta"]);
  });

  it("gets a document by id", async () => {
    const store = await import("../src/store/repoStore.js");
    const doc = await store.get("acme/beta");

    expect(doc.metadata.id).toBe("acme/beta");
    expect(doc.content).toContain("Beta content");
  });

  it("checks document existence", async () => {
    const store = await import("../src/store/repoStore.js");
    expect(await store.exists("acme/alpha")).toBe(true);
    expect(await store.exists("missing")).toBe(false);
  });

  it("searches by metadata", async () => {
    const store = await import("../src/store/repoStore.js");
    const results = await store.search("alpha");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("acme/alpha");
  });
});
