const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

contextBridge.exposeInMainWorld("rssParser", {
  fetchRSS: (url) => ipcRenderer.invoke("fetch-rss", url),
});

contextBridge.exposeInMainWorld("feedStore", {
  getFeeds: () => ipcRenderer.invoke("get-feeds"),
  addFeed: (url, title) => ipcRenderer.invoke("add-feed", url, title),
  removeFeed: (url) => ipcRenderer.invoke("remove-feed", url),
});
