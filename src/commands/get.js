import { readFile } from "node:fs/promises";

import { resolve } from "../resolver.js";
import { getAnnotationsFile } from "../utils/paths.js";
import { isJsonMode, outputJson } from "../utils/jsonOutput.js";
import { warn } from "../utils/logger.js";

const formatMetadata = (metadata) => {
  const lines = [
    `id: ${metadata.id}`,
    `title: ${metadata.title}`
  ];

  if (metadata.description) {
    lines.push(`description: ${metadata.description}`);
  }

  if (metadata.tags) {
    lines.push(`tags: ${Array.isArray(metadata.tags) ? metadata.tags.join(", ") : metadata.tags}`);
  }

  return lines.join("\n");
};

const readAnnotations = async (id) => {
  try {
    const raw = await readFile(getAnnotationsFile(), "utf8");
    const data = JSON.parse(raw);
    return data[id] ?? [];
  } catch {
    return [];
  }
};

const formatAnnotations = (annotations) => {
  if (!annotations.length) {
    return "";
  }
  const lines = annotations.map((note) => `- ${note}`);
  return `\n\nAnnotations:\n${lines.join("\n")}`;
};

const register = (program) => {
  program
    .command("get")
    .description("Fetch a documentation entry")
    .argument("<id>", "Document id")
    .option("--lang <lang>", "Language filter for chub")
    .option("--source <source>", "Force source: local, team, chub, cascade", "cascade")
    .option("--no-cache", "Bypass chub cache")
    .option("--json", "Output JSON")
    .action(async (id, options) => {
      try {
        const result = await resolve(id, options);
        const annotations = await readAnnotations(id);

        if (isJsonMode()) {
          if (typeof result === "string") {
            outputJson({ content: result, annotations });
          } else {
            outputJson({ ...result, annotations });
          }
          return;
        }

        if (typeof result === "string") {
          process.stdout.write(`${result}${formatAnnotations(annotations)}\n`);
          return;
        }

        process.stdout.write(
          `${formatMetadata(result.metadata)}\n\n${result.content}${formatAnnotations(annotations)}\n`
        );
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
