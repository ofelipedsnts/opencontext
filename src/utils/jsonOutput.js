const isJsonMode = () => process.argv.includes("--json");

const outputJson = (data) => {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
};

export { isJsonMode, outputJson };
