#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "node:module";

import { register as registerInit } from "../src/commands/init.js";
import { register as registerAdd } from "../src/commands/add.js";
import { register as registerGet } from "../src/commands/get.js";
import { register as registerList } from "../src/commands/list.js";
import { register as registerSearch } from "../src/commands/search.js";
import { register as registerAnnotate } from "../src/commands/annotate.js";
import { register as registerSync } from "../src/commands/sync.js";
import { register as registerConfig } from "../src/commands/config.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
  .name("opencontext")
  .description("OpenContext CLI")
  .version(pkg.version);

registerInit(program);
registerAdd(program);
registerGet(program);
registerList(program);
registerSearch(program);
registerAnnotate(program);
registerSync(program);
registerConfig(program);

program.parse(process.argv);
