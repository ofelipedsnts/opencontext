import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "opencontext-"));

describe("config", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    process.env.OPENCONTEXT_CONFIG_DIR = tempDir;
    vi.resetModules();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.OPENCONTEXT_CONFIG_DIR;
  });

  it("returns default config values", async () => {
    const { getConfig } = await import("../src/utils/config.js");
    const config = getConfig();

    expect(config.version).toBe("1.0");
    expect(config.mode).toBe("personal");
    expect(config.sync.enabled).toBe(false);
    expect(config.chub.enabled).toBe(true);
    expect(config.defaults.source).toBe("cascade");
  });

  it("persists updates with setConfig", async () => {
    const { getConfig, setConfig } = await import("../src/utils/config.js");

    setConfig("mode", "team");
    const config = getConfig();

    expect(config.mode).toBe("team");
  });
});
