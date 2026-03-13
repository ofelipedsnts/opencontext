import { describe, expect, it, vi } from "vitest";

const loadPaths = async (dir) => {
  process.env.OPENCONTEXT_CONFIG_DIR = dir;
  vi.resetModules();
  const module = await import("../src/utils/paths.js");
  return module;
};

describe("paths", () => {
  it("resolves config-based paths from env", async () => {
    const baseDir = "/tmp/opencontext-test";
    const {
      getConfigDir,
      getPrivateDir,
      getAnnotationsFile,
      getCacheDir,
      getContentDir
    } = await loadPaths(baseDir);

    expect(getConfigDir()).toBe(baseDir);
    expect(getPrivateDir()).toBe(`${baseDir}/private`);
    expect(getAnnotationsFile()).toBe(`${baseDir}/annotations/annotations.json`);
    expect(getCacheDir()).toBe(`${baseDir}/cache`);
    expect(getContentDir()).toContain("/content");
  });
});
