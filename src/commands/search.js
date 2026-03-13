import { resolveSearch } from "../resolver.js";
import { isJsonMode, outputJson } from "../utils/jsonOutput.js";
import { warn } from "../utils/logger.js";

const register = (program) => {
  program
    .command("search")
    .description("Search documentation across sources")
    .argument("<query>", "Search query")
    .option("--source <source>", "Force source: local, team, chub, cascade", "cascade")
    .option("--json", "Output JSON")
    .action(async (query, options) => {
      try {
        const result = await resolveSearch(query, options);

        if (isJsonMode()) {
          outputJson(result);
          return;
        }

        const output = [];
        if (result.local.length) {
          output.push("local:");
          for (const doc of result.local) {
            output.push(`- ${doc.id}: ${doc.name}`);
          }
        }

        if (result.team.length) {
          output.push("team:");
          for (const doc of result.team) {
            output.push(`- ${doc.id}: ${doc.name}`);
          }
        }

        if (typeof result.chub === "string" && result.chub.trim()) {
          output.push("chub:");
          output.push(result.chub.trim());
        }

        if (output.length === 0) {
          process.stdout.write("No results found.\n");
          return;
        }

        process.stdout.write(`${output.join("\n")}\n`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
