/* eslint-disable react/prop-types */
import React from "react";
import { create, act } from "react-test-renderer";
import { createStore, connect } from "frontity";
import { Provider } from "@frontity/connect";
import useFills from "./use-fills";

let store;

// spy on the console.warn calls
const warn = jest.spyOn(global.console, "warn");

const FillComponent = ({ number }) => (
  <div id="test-fill">
    Im a Fill
    <span>{number}</span>
  </div>
);

beforeEach(() => {
  warn.mockClear();

  store = createStore({
    actions: {
      fillActions: {
        setNumber: ({ state }) => (number: number) => {
          state.fills["test fill"].props.number = number;
        },
      },
    },
    state: {
      fills: {
        "test fill": {
          slot: "slot 1",
          library: "FillComponent",
          props: {
            number: 42,
          },
        },
      },
    },
    libraries: {
      fills: {
        FillComponent,
      },
    },
  });
});

describe("useFills", () => {
  it("Should work in the most basic case", () => {
    const Comp = connect(() => {
      const fills = useFills("slot 1");

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(app.toJSON().props).toEqual({ id: "test-fill" });
    expect(app.toJSON().children[0]).toEqual("Im a Fill");
    expect(app.root.findByType("span").children).toEqual(["42"]);

    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should work when the slot does not exist and should show a warning", () => {
    const Comp = connect(() => {
      const fills = useFills("slot that does not exist");

      expect(fills).toEqual([]);

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(app.toJSON()).toEqual(null);
    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should remind to specify the slot name if called without arguments", () => {
    const warn = jest.spyOn(global.console, "warn");

    const Comp = connect(() => {
      // This is just to trick typescript to allow us to call
      // useFills without any arguments
      const useFills2: any = useFills;
      const fills = useFills2();

      expect(fills).toEqual([]);

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(warn.mock.calls[0][0]).toMatch(
      "You should pass the name of the slot that you would like to fill!"
    );

    expect(app.toJSON()).toEqual(null);
    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should return [] when state.fills.[].library is not specified", () => {
    delete store.state.fills["test fill"].library;

    const Comp = connect(() => {
      const fills = useFills("slot 1");
      expect(fills).toEqual([]);

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(app.toJSON()).toEqual(null);
    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should return [] when the state.fills.[].slot is not specified", () => {
    delete store.state.fills["test fill"].slot;

    const Comp = connect(() => {
      const fills = useFills("slot 1");
      expect(fills).toEqual([]);

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(app.toJSON()).toEqual(null);
    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should work when `state.fills` is missing", () => {
    delete store.state.fills;

    const Comp = connect(() => {
      const fills = useFills("slot 1");
      expect(fills).toEqual([]);

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    expect(app.toJSON()).toEqual(null);
    expect(app.toJSON()).toMatchSnapshot();
  });

  it("Should re-render the fill when updating the props", () => {
    const Comp = connect(() => {
      const fills = useFills("slot 1");

      return (
        <>
          {fills.map(({ Fill, props, key }) => (
            <Fill key={key} {...props} />
          ))}
        </>
      );
    });

    const app = create(
      <Provider value={store}>
        <Comp />
      </Provider>
    );

    act(() => {
      store.actions.fillActions.setNumber(43);
    });

    expect(app.toJSON().props).toEqual({ id: "test-fill" });
    expect(app.toJSON().children[0]).toEqual("Im a Fill");
    expect(app.root.findByType("span").children).toEqual(["43"]);

    expect(app.toJSON()).toMatchSnapshot();
  });
});
