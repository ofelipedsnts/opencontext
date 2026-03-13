import { resolveList } from "../resolver.js";
import { isJsonMode, outputJson } from "../utils/jsonOutput.js";
import { warn } from "../utils/logger.js";

const formatRow = (doc, source) => {
  const tags = Array.isArray(doc.tags) ? doc.tags.join(", ") : doc.tags ?? "";
  return `${doc.id}\t${doc.title}\t${source}\t${tags}`;
};

const register = (program) => {
  program
    .command("list")
    .description("List available documentation")
    .option("--source <source>", "Force source: local, team, chub, cascade", "cascade")
    .option("--json", "Output JSON")
    .action(async (options) => {
      try {
        const result = await resolveList(options);

        if (isJsonMode()) {
          outputJson(result);
          return;
        }

        const rows = [];
        for (const doc of result.local) {
          rows.push(formatRow(doc, "local"));
        }
        for (const doc of result.team) {
          rows.push(formatRow(doc, "team"));
        }

        if (rows.length === 0) {
          process.stdout.write("No documents found.\n");
          return;
        }

        process.stdout.write("id\ttitle\tsource\ttags\n");
        process.stdout.write(`${rows.join("\n")}\n`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
