const { Application } = require("spectron");
const path = require("path");

jest.setTimeout(30000);

describe("RSS Reader App - Add Feed", () => {
  let app;

  beforeAll(async () => {
    app = new Application({
      path: path.join(__dirname, "../node_modules/.bin/electron"),
      args: [path.join(__dirname, "..")],
      env: {
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        DISPLAY: process.env.DISPLAY || ":99",
      },
    });
    await app.start();
    await app.client.waitUntilWindowLoaded();
  });

  afterAll(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it("should add a new feed", async () => {
    const client = app.client;

    // Type the RSS URL and title
    await client.setValue("#rss-url", "https://example.com/rss");
    await client.setValue("#rss-title", "Example Feed");

    // Click the add feed button
    await client.click("#add-feed");

    // Verify that the new feed is added to the list
    const feedTitle = await client.getText(".feed-title");
    expect(feedTitle).toContain("Example Feed");
  });
});
