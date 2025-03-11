describe("RSS Reader App - Add Feed", () => {
  beforeEach(() => {
    // Visit the application
    cy.visit("index.html");

    // Ensure the application is fully loaded
    cy.get("#rss-url").should("be.visible");
    cy.get("#rss-title").should("be.visible");
    cy.get("#add-feed").should("be.visible");
  });

  it("should add a new feed", () => {
    // Type the RSS URL and title
    cy.get("#rss-url").type("https://example.com/rss");
    cy.get("#rss-title").type("Example Feed");

    // Click the add feed button
    cy.get("#add-feed").click();

    // Verify that the new feed is added to the list
    cy.contains("Example Feed").should("be.visible");
  });
});

// Handle uncaught exceptions
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore specific errors
  if (err.message.includes("getFeeds")) {
    return false;
  }
  // Allow other errors to fail the test
  return true;
});
