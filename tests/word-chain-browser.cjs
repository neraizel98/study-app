require("./arcade-browser.cjs")("chain").catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
