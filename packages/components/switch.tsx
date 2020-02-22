import { warn } from "@frontity/error";
import { connect, styled } from "frontity";
import { Connect, Package } from "frontity/types";
import React, { isValidElement, ReactNode, ReactNodeArray } from "react";

// TODO: Better Handling of Error Responses.
// Fix issues with path props (isError value)

type SwitchComponent = React.FC<
  Connect<
    Package,
    {
      children?: ReactNode;
      when?: boolean;
      path?: string;
    }
  >
>;

const description404 = (
  <>
    That page can’t be found{" "}
    <span role="img" aria-label="confused face">
      😕
    </span>
  </>
);

const description = (
  <>
    Don&apos;t panic! Seems like you encountered an error. If this persists,
    <a href="https://community.frontity.org"> let us know </a> or try refreshing
    your browser.
  </>
);

// Default 404 Error Component
const DefaultErrorComponent = ({ state }) => {
  const data = state.source.get(state.router.link);

  const title = "Oops! Something went wrong";
  const title404 = "Oops! 404";

  return (
    <Container>
      <Title>{data.is404 ? title404 : title}</Title>
      <Description>{data.is404 ? description404 : description}</Description>
    </Container>
  );
};

const ErrorComponent = connect(DefaultErrorComponent);

const Container = styled.div`
  width: 800px;
  margin: 0;
  padding: 24px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  margin-top: 24px;
  margin-bottom: 8px;
  color: rgba(12, 17, 43);
  font-size: 4em;
`;

const Description = styled.div`
  line-height: 1.6em;
  color: rgba(12, 17, 43, 0.8);
  margin: 24px 0;
`;

const Switch: SwitchComponent = ({ state, children }) => {
  const currentPath = state.router.link.replace(/\/$/, "");
  const components: ReactNodeArray = React.Children.toArray(children);

  // Check if components[] has a non-ReactNode type Element
  const hasInvalidComponent: boolean =
    components.findIndex(component => !React.isValidElement(component)) !== -1;

  if (hasInvalidComponent) {
    warn("WIP: Child of <Switch /> component should be of type ReactNode");
  }

  // Match path with currentPath(state.router.link)
  const pathIsAMatch = (props): boolean =>
    props.path && props.path === currentPath;

  const componentIsAMatch = (component: ReactNode) =>
    isValidElement(component) &&
    (component.props.when ||
      (component.props.path && pathIsAMatch(component.props)));

  // Filter components by the value of the 'when' props or path
  const filteredComponents = components.filter(component =>
    componentIsAMatch(component)
  );

  // Render filteredComponents
  if (filteredComponents.length > 0) {
    return (
      <React.Fragment>
        {filteredComponents.map(filteredComponent => filteredComponent)}
      </React.Fragment>
    );
  }

  // Return frontity default 404 page
  return <ErrorComponent />;
};

export default connect(Switch);
