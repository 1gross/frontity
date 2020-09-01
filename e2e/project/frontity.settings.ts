import { Settings } from "frontity/types";

const settings: Settings = [
  {
    name: "head",
    packages: ["e2e-head"],
  },
  {
    name: "image",
    packages: ["e2e-image"],
  },
  {
    name: "fonts",
    packages: [
      {
        name: "@frontity/tiny-router",
        state: { router: { autoFetch: false } },
      },
      "e2e-fonts",
    ],
  },
  {
    name: "emotion",
    packages: [
      {
        name: "@frontity/tiny-router",
        state: { router: { autoFetch: false } },
      },
      "e2e-emotion",
    ],
  },
  {
    name: "loadable",
    packages: ["e2e-loadable"],
  },
  {
    name: "iframe",
    packages: ["e2e-iframe"],
  },
  {
    name: "wp-source-errors",
    packages: [
      "e2e-wp-source-errors",
      "@frontity/wp-source",
      "@frontity/tiny-router",
    ],
  },
  {
    name: "script",
    packages: ["e2e-script"],
  },
  {
    name: "switch",
    packages: ["e2e-switch"],
  },
  {
    name: "html2react",
    packages: ["e2e-html2react", "@frontity/html2react"],
  },
  {
    name: "tiny-router",
    packages: [
      "e2e-tiny-router",
      {
        name: "@frontity/tiny-router",
        state: { router: { autoFetch: false } },
      },
      {
        name: "@frontity/wp-source",
        state: { source: { api: "https://test.frontity.org/wp-json" } },
      },
    ],
  },
  {
    name: "google-tag-manager",
    packages: [
      "e2e-analytics",
      "@frontity/tiny-router",
      {
        name: "@frontity/google-tag-manager-analytics",
        state: {
          googleTagManagerAnalytics: {
            containerId: "GTM-XXXXXX-X",
          },
        },
      },
    ],
  },
  {
    name: "comscore-analytics",
    packages: [
      "e2e-analytics",
      "@frontity/tiny-router",
      {
        name: "@frontity/comscore-analytics",
        state: {
          comscoreAnalytics: {
            trackingIds: ["111111", "222222"],
          },
        },
      },
    ],
  },
  {
    name: "use-in-view",
    packages: ["e2e-use-in-view"],
  },
  {
    name: "slot-and-fill",
    packages: ["e2e-slot-and-fill"],
  },
  {
    name: "analytics",
    packages: ["e2e-analytics", "@frontity/tiny-router", "@frontity/analytics"],
  },
  {
    name: "google-analytics",
    packages: [
      "e2e-analytics",
      "@frontity/tiny-router",
      {
        name: "@frontity/google-analytics",
        state: {
          googleAnalytics: {
            trackingIds: ["UA-XXXXXX-X", "UA-YYYYYY-Y"],
          },
        },
      },
    ],
  },
  {
    name: "google-ad-manager",
    packages: [
      "e2e-ads",
      "@frontity/tiny-router",
      {
        name: "@frontity/google-ad-manager",
        state: {
          fills: {
            googleAdManager: {
              headerAd: {
                slot: "header",
                library: "googleAdManager.GooglePublisherTag",
                priority: 5,
                props: {
                  id: "header-ad",
                  unit: "/4595/nfl.test.open",
                  size: [300, 250],
                },
              },
              contentAd: {
                slot: "content",
                library: "googleAdManager.GooglePublisherTag",
                priority: 5,
                props: {
                  id: "content-ad",
                  unit: "/4595/nfl.test.open",
                  size: [300, 250],
                },
              },
              footerAd: {
                slot: "footer",
                library: "googleAdManager.GooglePublisherTag",
                priority: 5,
                props: {
                  id: "footer-ad",
                  unit: "/4595/nfl.test.open",
                  size: [
                    [300, 250],
                    [300, 600],
                  ],
                },
              },
            },
          },
        },
      },
    ],
  },
  {
    name: "wp-basic-tests",
    packages: [
      "e2e-wp-basic-tests",
      "@frontity/tiny-router",
      {
        name: "@frontity/wp-source",
        state: {
          source: {
            api: "http://localhost:8080/wp-json",
          },
        },
      },
    ],
  },
  {
    name: "yoast-package",
    state: {
      frontity: {
        url: "http://my.frontity.site",
        title: "Test Frontity Blog",
        description: "Useful content for Frontity development",
      },
    },
    packages: [
      "@frontity/tiny-router",
      "@frontity/html2react",
      {
        name: "@frontity/mars-theme",
        state: {
          theme: {
            menu: [
              ["Home", "/"],
              ["Nature", "/category/nature/"],
              ["Travel", "/category/travel/"],
              ["Japan", "/tag/japan/"],
              ["Sample Page", "/sample-page/"],
            ],
            featured: {
              showOnList: true,
              showOnPost: true,
            },
          },
        },
      },
      {
        name: "@frontity/wp-source",
        state: {
          source: {
            api: "http://localhost:8080/wp-json",
            postTypes: [
              {
                type: "movie",
                endpoint: "movies",
                archive: "/movies",
              },
            ],
            taxonomies: [
              {
                taxonomy: "actor",
                endpoint: "actors",
                postTypeEndpoint: "movies",
              },
            ],
          },
        },
      },
      {
        name: "@frontity/yoast",
        state: {
          yoast: {
            transformLinks: {
              /**
               * Yoast SEO package is surprisingly not including the port number
               * in links so even thought WordPress is running in
               * http://localhost:8080, all links end being something like
               * http://localhost/hello-world/ in the `yoast_head` field.
               *
               * As a workaround, we have to explicitly set the `base` property
               * here.
               */
              base: "http://localhost",
            },
          },
        },
      },
    ],
  },
];

export default settings;
