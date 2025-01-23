const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

contextBridge.exposeInMainWorld("rssParser", {
  fetchRSS: (url) => ipcRenderer.invoke("fetch-rss", url),
});

contextBridge.exposeInMainWorld("feedStore", {
  getFeeds: () => ipcRenderer.invoke("get-feeds"),
  addFeed: (url) => ipcRenderer.invoke("add-feed", url),
  removeFeed: (url) => ipcRenderer.invoke("remove-feed", url),
});

contextBridge.exposeInMainWorld("settings", {
  getSampleData: () => ipcRenderer.invoke("get-sample-data"),
  setSampleData: (data) => ipcRenderer.invoke("set-sample-data", data),
});
