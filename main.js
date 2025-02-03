const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("node:path");
const settings = require("electron-settings");
const Parser = require("rss-parser");
const parser = new Parser();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");

  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });

  ipcMain.handle("fetch-rss", async (event, url) => {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error) {
      console.error("Error fetching RSS:", error);
      throw error;
    }
  });

  ipcMain.handle("get-feeds", async () => {
    const feeds = await settings.get("feeds", []);
    return Array.isArray(feeds) ? feeds : [];
  });

  ipcMain.handle("add-feed", async (event, url, title) => {
    let feeds = await settings.get("feeds", []);
    feeds = Array.isArray(feeds) ? feeds : [];
    const feedData = {url, title}
    if (!feeds.some(feed => feed.url === url)) {
      feeds.push(feedData);
      await settings.set("feeds", feeds);
    }
    return feeds;
  });

  ipcMain.handle("remove-feed", async (event, url) => {
    let feeds = await settings.get("feeds", []);
    feeds = Array.isArray(feeds) ? feeds : [];
    feeds = feeds.filter((feed) => feed.url !== url);
    await settings.set("feeds", feeds);
    return feeds;
  });

  ipcMain.handle("get-sample-data", async () => {
    return settings.get("key.data");
  });

  ipcMain.handle("set-sample-data", async (event, data) => {
    await settings.set("key", { data });
  });

  console.log("Settings file path:", settings.file());

};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
