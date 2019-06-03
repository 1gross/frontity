import { getParams, getRoute } from "../routeUtils";

describe("route utils - getParams", () => {
  test("from params (fixes path)", () => {
    expect(getParams({ path: "/some/path" })).toEqual({
      path: "/some/path/",
      page: 1,
      query: {}
    });
  });
  test("from params (path, page)", () => {
    expect(getParams({ path: "/some/path/", page: 2 })).toEqual({
      path: "/some/path/",
      page: 2,
      query: {}
    });
  });
  test("from params (path, page, query)", () => {
    expect(
      getParams({
        path: "/some/path",
        page: 2,
        query: {
          k1: "v1",
          k2: "v2"
        }
      })
    ).toEqual({
      path: "/some/path/",
      page: 2,
      query: {
        k1: "v1",
        k2: "v2"
      }
    });
  });
  test("from path", () => {
    expect(getParams("/some/path/")).toEqual({
      path: "/some/path/",
      page: 1,
      query: {}
    });
  });
  test("from path (fixes path)", () => {
    expect(getParams("/some/path")).toEqual({
      path: "/some/path/",
      page: 1,
      query: {}
    });
  });
  test("from path and page", () => {
    expect(getParams("/some/path/page/2/")).toEqual({
      path: "/some/path/",
      page: 2,
      query: {}
    });
  });
  test("from path and query", () => {
    expect(getParams("/some/path/?k1=v1&k2=v2")).toEqual({
      path: "/some/path/",
      page: 1,
      query: {
        k1: "v1",
        k2: "v2"
      }
    });
  });
  test("from path, page and query", () => {
    expect(getParams("/some/path/page/2?k1=v1&k2=v2")).toEqual({
      path: "/some/path/",
      page: 2,
      query: {
        k1: "v1",
        k2: "v2"
      }
    });
  });
  test("from full URL", () => {
    expect(
      getParams("https://test.frontity.org/some/path/?k1=v1&k2=v2")
    ).toEqual({
      path: "/some/path/",
      page: 1,
      query: {
        k1: "v1",
        k2: "v2"
      }
    });
  });
});

describe("route utils - getRoute", () => {
  test("from params (fixes path)", () => {
    expect(getRoute({ path: "/some/path" })).toBe("/some/path/");
  });
  test("from params (path, page)", () => {
    expect(getRoute({ path: "/some/path/", page: 2 })).toBe(
      "/some/path/page/2/"
    );
  });
  test("from params (path, page, query)", () => {
    expect(
      getRoute({
        path: "/some/path",
        page: 2,
        query: {
          k1: "v1",
          k2: "v2"
        }
      })
    ).toBe("/some/path/page/2/?k1=v1&k2=v2");
  });
  test("from path", () => {
    expect(getRoute("/some/path/")).toBe("/some/path/");
  });
  test("from path (fixes path)", () => {
    expect(getRoute("/some/path")).toBe("/some/path/");
  });
  test("from path and page", () => {
    expect(getRoute("/some/path/page/2/")).toBe("/some/path/page/2/");
  });
  test("from path and query", () => {
    expect(getRoute("/some/path/?k1=v1&k2=v2")).toBe("/some/path/?k1=v1&k2=v2");
  });
  test("from path, page and query", () => {
    expect(getRoute("/some/path/page/2?k1=v1&k2=v2")).toBe(
      "/some/path/page/2/?k1=v1&k2=v2"
    );
  });
  test("from full URL", () => {
    expect(
      getRoute("https://test.frontity.org/some/path/page/2?k1=v1&k2=v2")
    ).toBe("/some/path/page/2/?k1=v1&k2=v2");
  });
});
