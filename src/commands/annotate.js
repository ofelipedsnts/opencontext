import { mkdir, readFile, writeFile } from "node:fs/promises";

import { getAnnotationsFile } from "../utils/paths.js";
import { isJsonMode, outputJson } from "../utils/jsonOutput.js";
import { warn, success } from "../utils/logger.js";

const readAnnotations = async () => {
  const filePath = getAnnotationsFile();
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const writeAnnotations = async (data) => {
  const filePath = getAnnotationsFile();
  const dir = filePath.replace("/annotations.json", "");
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const register = (program) => {
  program
    .command("annotate")
    .description("Add or manage annotations")
    .argument("[id]", "Document id")
    .argument("[note]", "Annotation text")
    .option("--clear", "Clear annotations for a document")
    .option("--list", "List all annotations")
    .option("--json", "Output JSON")
    .action(async (id, note, options) => {
      try {
        const data = await readAnnotations();

        if (options.list) {
          if (isJsonMode()) {
            outputJson(data);
            return;
          }
          const lines = Object.entries(data).flatMap(([key, notes]) =>
            notes.map((entry) => `${key}: ${entry}`)
          );
          process.stdout.write(`${lines.join("\n")}\n`);
          return;
        }

        if (!id) {
          throw new Error("Document id is required");
        }

        if (options.clear) {
          delete data[id];
          await writeAnnotations(data);
          success(`Cleared annotations for ${id}`);
          return;
        }

        if (!note) {
          throw new Error("Annotation text is required");
        }

        const list = data[id] ?? [];
        list.push(note);
        data[id] = list;
        await writeAnnotations(data);
        success(`Annotated ${id}`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
