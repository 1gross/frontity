import React from "react";
import { render } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import { useConnect } from "frontity";
import useInfiniteScroll from "../use-infinite-scroll";
import * as usePostTypeInfiniteScroll from "../use-post-type-infinite-scroll";

jest.mock("../use-infinite-scroll", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("frontity", () => ({
  useConnect: jest.fn(),
  connect: jest.fn((fn) => fn),
  css: jest.fn(),
}));

const spiedUsePostTypeInfiniteScroll = jest.spyOn(
  usePostTypeInfiniteScroll,
  "default"
);
const mockedUseInfiniteScroll = useInfiniteScroll as jest.MockedFunction<
  typeof useInfiniteScroll
>;
const mockedUseConnect = useConnect as jest.MockedFunction<typeof useConnect>;
const sourceGet = jest.fn();
const sourceFetch = jest.fn();
const routerUpdateState = jest.fn();

const App = ({ options }: { options?: any }) => {
  usePostTypeInfiniteScroll.default(options);
  return <div />;
};

const AppWithButton = ({ options }: { options?: any }) => {
  const { fetchNext } = usePostTypeInfiniteScroll.default(options);
  return (
    <div>
      <button onClick={fetchNext}>Fetch Next</button>
    </div>
  );
};

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  container.id = "container";
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
  spiedUsePostTypeInfiniteScroll.mockClear();
  mockedUseInfiniteScroll.mockReset();
  mockedUseConnect.mockReset();
  sourceGet.mockReset();
  sourceFetch.mockReset();
  routerUpdateState.mockReset();
});

describe("usePostTypeInfiniteScroll", () => {
  test("should update the browser state on mount (whithout existing state)", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: { link: "/post-one/", state: {} },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "/",
        pages: ["/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state on mount (with existing state)", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            someOtherPackage: {},
            infiniteScroll: {
              limit: 3,
              archive: "/",
              links: ["/post-one/"],
              pages: ["/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      someOtherPackage: {},
      infiniteScroll: {
        limit: 3,
        archive: "/",
        pages: ["/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state with `limit` options", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App options={{ limit: 1 }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        limit: 1,
        archive: "/",
        pages: ["/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state with `archive` set to the value in `options.archive`", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive")
        ? [{ link: "/post-one/" }, { link: "/post-two/" }]
        : undefined,
    }));

    act(() => {
      render(<App options={{ archive: "@options-archive" }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "@options-archive",
        pages: ["@options-archive"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state with `archive` set to the value already in state", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive")
        ? [{ link: "/post-one/" }, { link: "/post-two/" }]
        : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "/initial-archive/",
        pages: ["/initial-archive/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state with `archive` set to the value in `state.router.previous` if that's an archive", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          previous: "/previous-archive/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive")
        ? [{ link: "/post-one/" }, { link: "/post-two/" }]
        : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "/previous-archive/",
        pages: ["/previous-archive/"],
        links: ["/post-one/"],
      },
    });
  });

  test('should update the browser state with `archive` set to "/" if the value in `state.router.previous` is not an archive', () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          previous: "/previous-archive/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "/",
        pages: ["/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should update the browser state with `archive` set to the value in `options.fallback`", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App options={{ fallback: "@fallback-archive" }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "@fallback-archive",
        pages: ["@fallback-archive"],
        links: ["/post-one/"],
      },
    });
  });

  test('should update the browser state with `archive` set to "/"', () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledWith({
      infiniteScroll: {
        archive: "/",
        pages: ["/"],
        links: ["/post-one/"],
      },
    });
  });

  test("should not update the browser state if `options.active` is false", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
    }));

    act(() => {
      render(<App options={{ active: false }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).not.toHaveBeenCalled();
  });

  test("should request the archive if not ready and not fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: link !== "/",
      isFetching: false,
      isArchive: true,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(sourceFetch).toHaveBeenCalledTimes(1);
    expect(sourceFetch).toHaveBeenCalledWith("/");
  });

  test("should not request the archive if `options.active` is false", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: link !== "/",
      isFetching: false,
    }));

    act(() => {
      render(<App options={{ active: false }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request the archive if it's ready", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: true,
      items: [],
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request the archive if it's fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: false,
      isFetching: true,
      isArchive: true,
      items: [],
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request the archive if it's not archive", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {},
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: false,
      isFetching: false,
      isArchive: false,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should request next page on last item", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(2);
    expect(routerUpdateState).toHaveBeenNthCalledWith(2, {
      infiniteScroll: {
        archive: "/initial-archive/",
        pages: ["/initial-archive/", "/initial-archive/page/2/"],
        links: ["/post-one/"],
      },
    });
    expect(sourceFetch).toHaveBeenCalledTimes(1);
    expect(sourceFetch).toHaveBeenCalledWith("/initial-archive/page/2/");
  });

  test("should not request next page on last item if `options.active` is false", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App options={{ active: false }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).not.toHaveBeenCalled();
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request next page on last item if there isn't next page", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request next page on last item if has reached limit", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App options={{ limit: 1 }} />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not request next page if it's not on last item", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive")
        ? [{ link: "/post-one/" }, { link: "/post-two/" }]
        : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(1);
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not fetch next page if ready", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: true,
      isFetching: false,
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(2);
    expect(routerUpdateState).toHaveBeenNthCalledWith(2, {
      infiniteScroll: {
        archive: "/initial-archive/",
        pages: ["/initial-archive/", "/initial-archive/page/2/"],
        links: ["/post-one/"],
      },
    });
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should not fetch next page if fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-one/",
          state: {
            infiniteScroll: {
              archive: "/initial-archive/",
              pages: ["/initial-archive/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        source: { fetch: sourceFetch },
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      next:
        link === "/initial-archive/" ? "/initial-archive/page/2/" : undefined,
      isReady: link !== "/initial-archive/page/2/",
      isFetching: link === "/initial-archive/page/2/",
      isArchive: link.includes("archive"),
      items: link.includes("archive") ? [{ link: "/post-one/" }] : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(routerUpdateState).toHaveBeenCalledTimes(2);
    expect(routerUpdateState).toHaveBeenNthCalledWith(2, {
      infiniteScroll: {
        archive: "/initial-archive/",
        pages: ["/initial-archive/", "/initial-archive/page/2/"],
        links: ["/post-one/"],
      },
    });
    expect(sourceFetch).not.toHaveBeenCalled();
  });

  test("should return the right object", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              archive: "/",
              pages: ["/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link === "/",
      items:
        link === "/"
          ? [{ link: "/post-one/" }, { link: "/post-two/" }]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: false,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLast` true for second last link if last link is not ready", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              archive: "/",
              pages: ["/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: link !== "/post-two/",
      isFetching: false,
      isArchive: link === "/",
      items:
        link === "/"
          ? [{ link: "/post-one/" }, { link: "/post-two/" }]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: false,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLimit` true if has reached limit and there is next item and is not fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              limit: 2,
              archive: "/",
              pages: ["/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link === "/",
      items:
        link === "/"
          ? [
              { link: "/post-one/" },
              { link: "/post-two/" },
              { link: "/post-three/" },
            ]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: true,
      isFetching: false,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLimit` false and `isFetching` true if next item is fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              limit: 2,
              archive: "/",
              pages: ["/"],
              links: ["/post-one/", "/post-two/", "/post-three/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: link !== "/post-three/",
      isFetching: link === "/post-three/",
      isArchive: link === "/",
      items:
        link === "/"
          ? [
              { link: "/post-one/" },
              { link: "/post-two/" },
              { link: "/post-three/" },
            ]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-three/",
          link: "/post-three/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: true,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLimit` false and `isFetching` true if next page is fetching", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              limit: 2,
              archive: "/",
              pages: ["/", "/page/2/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: link === "/page/2/",
      isArchive: !link.includes("post"),
      items: !link.includes("post")
        ? [{ link: link + "post-one/" }, { link: link + "post-two/" }]
        : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: true,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLimit` false if there isn't a next item", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              limit: 2,
              archive: "/",
              pages: ["/"],
              links: ["/post-one/", "/post-two/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link === "/",
      items:
        link === "/"
          ? [{ link: "/post-one/" }, { link: "/post-two/" }]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: false,
          Wrapper: expect.any(Function),
        },
        {
          key: "/post-two/",
          link: "/post-two/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: false,
      fetchNext: expect.any(Function),
    });
  });

  test("should return `isLimit` false if limit hasn't been reached", () => {
    mockedUseConnect.mockReturnValueOnce({
      state: {
        source: { get: sourceGet },
        router: {
          link: "/post-two/",
          state: {
            infiniteScroll: {
              limit: 2,
              archive: "/",
              pages: ["/"],
              links: ["/post-one/"],
            },
          },
        },
      },
      actions: {
        router: { updateState: routerUpdateState },
      },
    });

    sourceGet.mockImplementation((link) => ({
      link,
      isReady: true,
      isFetching: false,
      isArchive: link === "/",
      items:
        link === "/"
          ? [{ link: "/post-one/" }, { link: "/post-two/" }]
          : undefined,
    }));

    act(() => {
      render(<App />, container);
    });

    expect(spiedUsePostTypeInfiniteScroll).toHaveBeenCalledTimes(1);
    expect(spiedUsePostTypeInfiniteScroll).toHaveReturnedWith({
      posts: [
        {
          key: "/post-one/",
          link: "/post-one/",
          isLast: true,
          Wrapper: expect.any(Function),
        },
      ],
      isLimit: false,
      isFetching: false,
      fetchNext: expect.any(Function),
    });
  });

  test.todo("`fetchNext` should fetch next item");

  test.todo("`fetchNext` should fetch next page and next item");

  test.todo("`fetchNext` should not fetch next page if it's ready or fetching");

  test.todo("`fetchNext` should not fetch next item if it's ready or fetching");

  test.todo("`fetchNext` should do nothing if `options.active` is false");

  test.todo(
    "`fetchNext` should do nothing if there isn't a next item and there isn't a next page"
  );

  test.todo("`fetchNext` should do nothing if next item is already in links");
});

describe("Wrapper", () => {
  test.todo("should return children if IntersectionObserver is not supported");
});
