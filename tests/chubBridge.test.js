import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const makeTempDir = async () => mkdtemp(join(tmpdir(), "openctx-chub-"));

vi.mock("execa", () => ({
  execa: vi.fn()
}));

describe("chubBridge", () => {
  let tempDir;
  let execaMock;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    process.env.OPENCTX_CONFIG_DIR = tempDir;
    vi.resetModules();

    const { execa } = await import("execa");
    execaMock = execa;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.OPENCTX_CONFIG_DIR;
    vi.clearAllMocks();
  });

  it("reports chub availability", async () => {
    execaMock.mockResolvedValue({ stdout: "ok" });
    const bridge = await import("../src/chub/chubBridge.js");
    const available = await bridge.isChubAvailable();

    expect(available).toBe(true);
    expect(execaMock).toHaveBeenCalledWith("chub", ["--help"]);
  });

  it("returns cached data when valid", async () => {
    const bridge = await import("../src/chub/chubBridge.js");
    const { setConfig } = await import("../src/utils/config.js");

    setConfig("chub.cache", true);
    setConfig("chub.cacheTTL", 3600);

    execaMock.mockResolvedValue({ stdout: "fresh" });

    const first = await bridge.get("openai/chat");
    const second = await bridge.get("openai/chat");

    expect(first).toBe("fresh");
    expect(second).toBe("fresh");
    expect(execaMock).toHaveBeenCalledTimes(1);
  });

  it("bypasses cache when noCache is set", async () => {
    const bridge = await import("../src/chub/chubBridge.js");
    const { setConfig } = await import("../src/utils/config.js");

    setConfig("chub.cache", true);
    setConfig("chub.cacheTTL", 3600);

    execaMock.mockResolvedValue({ stdout: "fresh" });

    await bridge.get("openai/chat", { noCache: true });
    await bridge.get("openai/chat", { noCache: true });

    expect(execaMock).toHaveBeenCalledTimes(2);
  });

  it("passes lang flag to chub", async () => {
    const bridge = await import("../src/chub/chubBridge.js");
    execaMock.mockResolvedValue({ stdout: "doc" });

    await bridge.get("openai/chat", { lang: "py" });

    expect(execaMock).toHaveBeenCalledWith("chub", ["get", "openai/chat", "--lang", "py"]);
  });

  it("executes search", async () => {
    const bridge = await import("../src/chub/chubBridge.js");
    execaMock.mockResolvedValue({ stdout: "result" });

    const output = await bridge.search("auth");

    expect(output).toBe("result");
    expect(execaMock).toHaveBeenCalledWith("chub", ["search", "auth"]);
  });
});
