const { contextBridge, ipcRenderer } = require("electron");

// Expose dark mode functions to the renderer process
contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

// Expose parser functions to the renderer process
contextBridge.exposeInMainWorld("rssParser", {
  fetchRSS: (url) => ipcRenderer.invoke("fetch-rss", url),
});

// Expose store functions to the renderer process
contextBridge.exposeInMainWorld("feedStore", {
  getFeeds: () => ipcRenderer.invoke("get-feeds"),
  addFeed: (url, title, folder) => ipcRenderer.invoke("add-feed", url, title, folder),
  removeFeed: (url) => ipcRenderer.invoke("remove-feed", url),
});


// Expose opml handler to the renderer process
contextBridge.exposeInMainWorld("opmlHandler", {
  importFeeds: async () => ipcRenderer.invoke("import-opml"),
});