const { app, BrowserWindow } = require("electron");
const settings = require("electron-settings");

jest.mock("electron", () => ({
  app: {
    on: jest.fn(),
    whenReady: jest.fn().mockResolvedValue(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    on: jest.fn(),
  })),
}));

describe("Main Process", () => {
  it("should create a browser window", () => {
    const win = new BrowserWindow();
    expect(win).toBeDefined();
  });

  it("should have electron-settings module", () => {
    expect(settings).toBeDefined();
  });
});
