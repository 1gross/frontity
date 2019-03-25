import getPackages from "../getPackages";
import * as importSettings from "../importSettings";
import mockedMonoSettings from "./mocks/getPackages/monoSettings.json";
import mockedMultiSettings from "./mocks/getPackages/multiSettings.json";

jest.mock("../importSettings");

describe("getPackages", () => {
  const mockedImportSettings = importSettings as jest.Mocked<
    typeof importSettings
  >;

  afterEach(() => {
    mockedImportSettings.default.mockReset();
  });

  test("should work when `allSettings` is an object", async () => {
    mockedImportSettings.default.mockResolvedValue(mockedMonoSettings);
    const result = await getPackages();
    expect(result).toEqual({
      default: ["@frontity/theme", "@frontity/wp-source"]
    });
  });

  test("should work when `allSettings` is an array", async () => {
    mockedImportSettings.default.mockResolvedValue(mockedMultiSettings);
    const result = await getPackages();
    expect(result).toEqual({
      "settings-html": ["@frontity/theme-html", "@frontity/wp-source-html"],
      "settings-amp": ["@frontity/theme-amp", "@frontity/wp-source-amp"]
    });
  });
});
