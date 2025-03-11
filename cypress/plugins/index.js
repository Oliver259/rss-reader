const path = require("path");
const { exec } = require("child_process");

module.exports = (on, config) => {
  on("before:browser:launch", (browser = {}, launchOptions) => {
    if (browser.name === "electron") {
      const appPath = path.join(__dirname, "../../");
      exec(`electron ${appPath}`);
      return launchOptions;
    }
  });
};
