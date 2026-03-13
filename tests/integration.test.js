import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execa } from "execa";
import { mkdtemp, rm, mkdir, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = process.cwd();

const makeTempDir = async () => mkdtemp(join(tmpdir(), "opencontext-int-"));

const runCli = async (args, options) =>
  execa("node", ["bin/opencontext.js", ...args], {
    cwd: repoRoot,
    ...options
  });

const fixture = (name) => resolve(repoRoot, "tests", "fixtures", name);

describe("integration", () => {
  let tempDir;
  let env;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    env = {
      ...process.env,
      OPENCONTEXT_CONFIG_DIR: tempDir
    };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("add -> get (local)", async () => {
    await runCli(["init"], { env });
    await runCli(["add", fixture("acme/docs/alpha/DOC.md")], { env });

    const { stdout } = await runCli(["get", "acme/alpha"], { env });

    expect(stdout).toContain("name: alpha");
    expect(stdout).toContain("Alpha content");
  });

  it("add -> search (local)", async () => {
    await runCli(["init"], { env });
    await runCli(["add", fixture("acme/docs/beta/DOC.md")], { env });

    const { stdout } = await runCli(["search", "beta"], { env });

    expect(stdout).toContain("acme/beta");
  });

  it("delegates get to chub", async () => {
    const binDir = join(tempDir, "bin");
    await mkdir(binDir, { recursive: true });
    const chubPath = join(binDir, "chub");
    const script = `#!/usr/bin/env node
const [, , cmd] = process.argv;
if (cmd === "get") {
  process.stdout.write("CHUB_DOC");
} else if (cmd === "search") {
  process.stdout.write("CHUB_SEARCH");
} else {
  process.stdout.write("chub");
}
`;
    await writeFile(chubPath, script, "utf8");
    await chmod(chubPath, 0o755);

    const chubEnv = {
      ...env,
      PATH: `${binDir}:${process.env.PATH}`
    };

    const { stdout } = await runCli(["get", "openai/chat", "--source", "chub"], {
      env: chubEnv
    });

    expect(stdout).toContain("CHUB_DOC");
  });

  it("annotate -> get includes annotations", async () => {
    await runCli(["init"], { env });
    await runCli(["add", fixture("acme/docs/alpha/DOC.md")], { env });
    await runCli(["annotate", "acme/alpha", "Remember to update"], { env });

    const { stdout } = await runCli(["get", "acme/alpha"], { env });

    expect(stdout).toContain("Annotations:");
    expect(stdout).toContain("Remember to update");
  });
});
