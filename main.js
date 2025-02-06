const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("node:path");
const settings = require("electron-settings");
const Parser = require("rss-parser");
const parser = new Parser();

// require("electron-reload")(__dirname, {
//   electron: path.join(__dirname, "node_modules", ".bin", "electron"),
// });

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
