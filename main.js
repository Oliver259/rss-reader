const { app, BrowserWindow, ipcMain, nativeTheme, dialog } = require("electron");
const path = require("node:path");
const settings = require("electron-settings");
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");
const { parseStringPromise } = require("xml2js");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

// Function to create the main application window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");

  // Handle dark mode toggle
  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });

  // Handle reset to system theme
  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });

  // Handle fetching RSS feed
  ipcMain.handle("fetch-rss", async (event, url) => {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error) {
      console.error("Error fetching RSS:", error);
      throw error;
    }
  });

  // Handle getting saved feeds
  ipcMain.handle("get-feeds", async () => {
    const feeds = await settings.get("feeds", []);
    return Array.isArray(feeds) ? feeds : [];
  });

  // Handle adding a new feed
  ipcMain.handle("add-feed", async (event, url, title) => {
    let feeds = await settings.get("feeds", []);
    feeds = Array.isArray(feeds) ? feeds : [];
    const feedData = { url, title };
    if (!feeds.some((feed) => feed.url === url)) {
      feeds.push(feedData);
      await settings.set("feeds", feeds);
    }
    return feeds;
  });

  // Handle removing a feed
  ipcMain.handle("remove-feed", async (event, url) => {
    let feeds = await settings.get("feeds", []);
    feeds = Array.isArray(feeds) ? feeds : [];
    feeds = feeds.filter((feed) => feed.url !== url);
    await settings.set("feeds", feeds);
    return feeds;
  });

  ipcMain.handle("import-opml", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: "OPML Files", extensions: ["opml"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) return;

    const filePath = filePaths[0];
    const fileContent = fs.readFileSync(filePath, "utf-8");

    try {
      const result = await parseStringPromise(fileContent);
      const feeds = result.opml.body[0].outline.map((outline) => ({
        title: outline.$.title || outline.$.text,
        url: outline.$.xmlUrl,
      }));

      // Save feeds to settings
      let existingFeeds = await settings.get("feeds", []);
      existingFeeds = Array.isArray(existingFeeds) ? existingFeeds : [];
      const mergedFeeds = [
        ...existingFeeds,
        ...feeds.filter(
          (feed) =>
            !existingFeeds.some((existing) => existing.url === feed.url),
        ),
      ];
      await settings.set("feeds", mergedFeeds);

      return mergedFeeds;
    } catch (error) {
      console.error("Error importing OPML:", error);
      throw new Error("Failed to import OPML file.");
    }
  });
};

// Create the main window when the app is ready
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
