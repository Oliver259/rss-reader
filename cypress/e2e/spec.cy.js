describe("RSS Reader App", () => {
  it("should load the main page", () => {
    cy.visit("index.html");
    cy.contains("RSS Reader");
  });
});