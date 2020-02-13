import expect from "expect";

describe("Native iframe lazy-load", () => {
  beforeEach(() => {
    cy.viewport(1000, 1000);
    cy.visit("http://localhost:3001?name=iframe");
  });

  it("native lazy-load should exist", () => {
    return cy
      .window()
      .its("HTMLIFrameElement")
      .then(HTMLIframeElement => {
        expect("loading" in HTMLIframeElement.prototype).toBe(true);
      });
  });

  it("should render an iframe with a loading attribute and 'lazy' as value", () => {
    cy.scrollTo("topLeft");
    cy.get("iframe").should("have.attr", "loading", "lazy");
  });

  it.skip("should lazy-load iframes", () => {
    cy.scrollTo("topLeft");
    cy.get("iframe")
      .should("have.attr", "loading", "lazy")
      .should("no.be.visible");
    cy.get("iframe")
      .scrollIntoView({ duration: 300 })
      .should("be.visible");
  });
});

describe("Iframe lazy-load with Intersection Observer", () => {
  beforeEach(() => {
    cy.viewport(360, 640);
    cy.visit("http://localhost:3001?name=iframe", {
      onBeforeLoad(win) {
        Object.defineProperty(win.HTMLIFrameElement.prototype, "loading", {
          configurable: true,
          writable: true
        });
        delete win.HTMLIFrameElement.prototype.loading;
      }
    });
  });

  it("native lazy-load should not exist in iframe element", () => {
    return cy
      .window()
      .its("HTMLIFrameElement")
      .then(HTMLIframeElement => {
        expect("loading" in HTMLIframeElement.prototype).toBe(false);
      });
  });

  it.skip("loading attribute should not be lazy", () => {
    cy.scrollTo("bottomLeft");
    cy.get("iframe")
      .should("to.be.visible")
      .should("not.have.attr", "loading", "lazy");
  });

  it.skip("should lazy-load iframe", () => {
    cy.scrollTo("topLeft");
    cy.get("iframe").should("not.be.visible");
    cy.get("iframe")
      .scrollIntoView({ duration: 300 })
      .should("be.visible");
  });
});
