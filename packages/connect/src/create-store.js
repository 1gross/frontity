import { observable } from "./observable";

const getSnapshot = obj => {
  if (typeof obj === "function") return;
  if (typeof obj !== "object" || obj === null) return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = getSnapshot(item);
      return arr;
    }, []);
  }
  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      const res = getSnapshot(obj[key]);
      if (res !== undefined) newObj[key] = res;
      return newObj;
    }, {});
  }
};

const convertToAction = (fn, state) => (...args) => {
  const first = fn(state);
  if (first instanceof Promise) return first;
  if (typeof first === "function") {
    const second = first(...args);
    if (second instanceof Promise) return second;
  }
};

const convertedActions = (obj, state) => {
  if (typeof obj === "function") return convertToAction(obj, state);
  else if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = convertedActions(obj[key], state);
      return newObj;
    }, {});
  }
};

export const createStore = store => {
  const observableState = observable(store.state);
  return {
    ...store,
    state: observableState,
    actions: convertedActions(store.actions, observableState),
    getSnapshot: () => getSnapshot(store.state)
  };
};
