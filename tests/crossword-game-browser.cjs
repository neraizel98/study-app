require("./arcade-browser.cjs")("crossword").catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
