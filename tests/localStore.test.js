import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "opencontext-local-"));

const fixture = (name) => resolve("tests", "fixtures", name);

describe("localStore", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    process.env.OPENCONTEXT_CONFIG_DIR = tempDir;
    await mkdir(join(tempDir, "private", "acme", "docs", "alpha"), { recursive: true });
    await mkdir(join(tempDir, "private", "acme", "docs", "beta"), { recursive: true });
    await mkdir(join(tempDir, "private", "acme", "docs", "invalid"), { recursive: true });
    await copyFile(
      fixture("acme/docs/alpha/DOC.md"),
      join(tempDir, "private", "acme", "docs", "alpha", "DOC.md")
    );
    await copyFile(
      fixture("acme/docs/beta/DOC.md"),
      join(tempDir, "private", "acme", "docs", "beta", "DOC.md")
    );
    await copyFile(
      fixture("acme/docs/invalid/DOC.md"),
      join(tempDir, "private", "acme", "docs", "invalid", "DOC.md")
    );
    vi.resetModules();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.OPENCONTEXT_CONFIG_DIR;
  });

  it("lists valid documents", async () => {
    const store = await import("../src/store/localStore.js");
    const docs = await store.list();
    const ids = docs.map((doc) => doc.id).sort();

    expect(ids).toEqual(["acme/alpha", "acme/beta"]);
  });

  it("gets a document by id", async () => {
    const store = await import("../src/store/localStore.js");
    const doc = await store.get("acme/alpha");

    expect(doc.metadata.id).toBe("acme/alpha");
    expect(doc.content).toContain("Alpha content");
  });

  it("checks document existence", async () => {
    const store = await import("../src/store/localStore.js");
    expect(await store.exists("acme/beta")).toBe(true);
    expect(await store.exists("missing")).toBe(false);
  });

  it("searches by metadata", async () => {
    const store = await import("../src/store/localStore.js");
    const results = await store.search("beta");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("acme/beta");
  });
});
