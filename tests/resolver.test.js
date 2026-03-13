import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/store/localStore.js", () => ({
  exists: vi.fn(),
  get: vi.fn(),
  search: vi.fn()
}));

vi.mock("../src/store/repoStore.js", () => ({
  exists: vi.fn(),
  get: vi.fn(),
  search: vi.fn()
}));

vi.mock("../src/chub/chubBridge.js", () => ({
  get: vi.fn(),
  search: vi.fn()
}));

describe("resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes local/ prefix", async () => {
    const resolver = await import("../src/resolver.js");
    const localStore = await import("../src/store/localStore.js");
    localStore.get.mockResolvedValue({ metadata: { id: "doc" }, content: "" });

    const result = await resolver.resolve("local/doc");

    expect(localStore.get).toHaveBeenCalledWith("doc", {});
    expect(result.metadata.id).toBe("doc");
  });

  it("routes team/ prefix", async () => {
    const resolver = await import("../src/resolver.js");
    const repoStore = await import("../src/store/repoStore.js");
    repoStore.get.mockResolvedValue({ metadata: { id: "doc" }, content: "" });

    const result = await resolver.resolve("team/doc");

    expect(repoStore.get).toHaveBeenCalledWith("doc", {});
    expect(result.metadata.id).toBe("doc");
  });

  it("routes provider ids to chub", async () => {
    const resolver = await import("../src/resolver.js");
    const chub = await import("../src/chub/chubBridge.js");
    chub.get.mockResolvedValue("doc");

    const result = await resolver.resolve("openai/chat");

    expect(chub.get).toHaveBeenCalledWith("openai/chat", {
      lang: undefined,
      version: undefined,
      noCache: undefined
    });
    expect(result).toBe("doc");
  });

  it("cascades local then team then chub", async () => {
    const resolver = await import("../src/resolver.js");
    const localStore = await import("../src/store/localStore.js");
    const repoStore = await import("../src/store/repoStore.js");
    const chub = await import("../src/chub/chubBridge.js");

    localStore.exists.mockResolvedValue(false);
    repoStore.exists.mockResolvedValue(true);
    repoStore.get.mockResolvedValue({ metadata: { id: "doc" }, content: "" });

    const result = await resolver.resolve("doc");

    expect(localStore.exists).toHaveBeenCalledWith("doc");
    expect(repoStore.exists).toHaveBeenCalledWith("doc");
    expect(repoStore.get).toHaveBeenCalledWith("doc", {});
    expect(chub.get).not.toHaveBeenCalled();
    expect(result.metadata.id).toBe("doc");
  });

  it("forces source option", async () => {
    const resolver = await import("../src/resolver.js");
    const chub = await import("../src/chub/chubBridge.js");
    chub.get.mockResolvedValue("doc");

    const result = await resolver.resolve("doc", { source: "chub" });

    expect(chub.get).toHaveBeenCalledWith("doc", {
      lang: undefined,
      version: undefined,
      noCache: undefined
    });
    expect(result).toBe("doc");
  });

  it("aggregates search results", async () => {
    const resolver = await import("../src/resolver.js");
    const localStore = await import("../src/store/localStore.js");
    const repoStore = await import("../src/store/repoStore.js");
    const chub = await import("../src/chub/chubBridge.js");

    localStore.search.mockResolvedValue(["local"]);
    repoStore.search.mockResolvedValue(["team"]);
    chub.search.mockResolvedValue(["chub"]);

    const result = await resolver.resolveSearch("query");

    expect(result).toEqual({ local: ["local"], team: ["team"], chub: ["chub"] });
  });
});
