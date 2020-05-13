import { useConnect, warn } from "frontity";

interface Fill {
  slot: string;
  library: string;
  priority?: number;
  props?: {
    [key: string]: any;
  };
}

interface FillsPackage {
  state: {
    fills: { [key: string]: Fill };
  };
  libraries: {
    fills: {
      [key: string]: React.ComponentType;
    };
  };
}

const useFills = (name: string) => {
  const { state, libraries } = useConnect<FillsPackage>();

  if (!name) {
    warn("You should pass the name of the slot that you would like to fill!");
    return [];
  }

  // The user has not specified any fills yet
  if (!state.fills || typeof state.fills !== "object") {
    return [];
  }

  return (
    Object.entries(state.fills)

      // 1. Nest the `key` of the fill
      // 2. Add default priority of 10 if not present
      .map(([key, value]) => ({
        key,
        priority: value.priority || 10,
        ...value,
      }))

      // Match only the fills for this name.
      .filter(({ slot }) => slot === name)

      // Sort by priority
      .sort((a, b) => a.priority - b.priority)

      // Add real component to the array.
      .reduce(
        (
          allFills: (Fill & { Fill: React.ComponentType; key: string })[],
          fill
        ) => {
          const { fills } = libraries;
          const { library } = fill;

          // If we cannot find the fill component in `libraries`
          // OR
          // if we cannot find the reference to the component in `state.fills.library` we skip.
          if (!fills || !library) return allFills;

          const newFill = {
            ...fill,
            Fill: libraries.fills[fill.library],
          };

          return allFills.concat(newFill);
        },
        []
      )
  );
};

export default useFills;
