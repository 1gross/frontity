import Koa from "koa";
import { Package, Action, AsyncAction } from "frontity/types";
import Source from "@frontity/source/types";

interface WpSourceErrors extends Package {
  name: "wp-source-errors";
  state: {
    frontity?: Package["state"]["frontity"];
    source?: Source["state"]["source"] & {
      api: string;
    };
  };
  actions: {
    source?: Source["actions"]["source"];
    wpSourceErrors: {
      init: Action<WpSourceErrors>;
      beforeSSR: AsyncAction<
        WpSourceErrors,
        Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>
      >;
    };
  };
  roots: {
    wpSourceErrors: React.ReactType;
  };
  libraries: {
    source?: Source["libraries"]["source"];
  };
}

export default WpSourceErrors;
