import { Package } from ".";

// Resolves the derived state for things like Action and Derived.
export type ResolveState<State extends Package["state"]> = {
  [P in keyof State]: State[P] extends (state: Package["state"]) => any
    ? ReturnType<State[P]>
    : ResolveState<State[P]>
};

// Makes properties partial and works deeply.
interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}
type DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type DeepPartial<T> = T extends Array<infer U>
  ? DeepPartialArray<U>
  : T extends object
  ? DeepPartialObject<T>
  : T;

// Omits any property found in the passed object.
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Resolves the actions for things like Action and Derived.
export type ResolveActions<Actions extends Package["state"]> = {
  [P in keyof Actions]: Actions[P] extends (
    ...a: any
  ) => (arg: infer Arg) => void // Turns "state => args => {}" into "args => {}"
    ? (arg: Arg) => void // Turns "state => {}" into "() => {}"
    : Actions[P] extends (state: Package["state"]) => any
    ? () => void
    : ResolveActions<Actions[P]>
};
