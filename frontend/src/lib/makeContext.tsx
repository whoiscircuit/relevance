import React, { createContext, useContext, useReducer, useMemo } from "react";
import type { PropsWithChildren, FC } from "react";

// --- Helper Types ---

// Infers the payload type from the action function (2nd argument)
type Payload<F> = F extends (state: any, payload: infer P) => any ? P : never;

// Maps the original action definitions to functions that only take the payload
type MappedActions<A> = {
  [K in keyof A]: (payload: Payload<A[K]>) => void;
};

// Maps selector functions to their return values
type MappedSelectors<S, Sel> = {
  [K in keyof Sel]: Sel[K] extends (state: S) => infer R ? R : never;
};

// The combined state (Initial State + Calculated Selectors)
type CombinedState<S, Sel> = S & MappedSelectors<S, Sel>;

// The Return Type of the Hook: [State, Actions]
type StoreHook<S, A, Sel> = () => [CombinedState<S, Sel>, MappedActions<A>];

// --- The Main Function ---

export function makeContext<
  S,
  A extends Record<string, (state: S, payload: any) => S>,
  Sel extends Record<string, (state: S) => any>,
>(config: {
  state: S;
  actions: A;
  selectors?: Sel;
  debug?: boolean;
}): [FC<PropsWithChildren<unknown>>, StoreHook<S, A, Sel>] {
  const {
    state: initialState,
    actions: actionDefs,
    selectors: selectorDefs = {} as Sel,
    debug = false,
  } = config;

  // Define the Context Value Type
  interface ContextValue {
    state: CombinedState<S, Sel>;
    actions: MappedActions<A>;
  }

  const Context = createContext<ContextValue | null>(null);

  const reducer = (state: S, action: { type: keyof A; payload: any }): S => {
    const actionFn = actionDefs[action.type];
    if (!actionFn) return state;

    if (debug) {
      console.log(`[Action] ${String(action.type)}`, {
        payload: action.payload,
        previousState: state,
      });
    }

    const newState = actionFn(state, action.payload);

    if (debug) {
      console.log(`[State Updated] ${String(action.type)}`, {
        newState,
      });
    }

    return newState;
  };

  const Provider: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Memoize Actions
    const boundActions = useMemo(() => {
      const actions = {} as MappedActions<A>;
      (Object.keys(actionDefs) as Array<keyof A>).forEach((key) => {
        actions[key] = (payload: any) => dispatch({ type: key, payload });
      });
      return actions;
    }, []);

    // Memoize Selectors & Merge with State
    const derivedState = useMemo(() => {
      const computed = {} as MappedSelectors<S, Sel>;
      (Object.keys(selectorDefs) as Array<keyof Sel>).forEach((key) => {
        computed[key] = selectorDefs[key](state);
      });

      if (debug && Object.keys(computed).length > 0) {
        console.log("[Selectors Computed]", computed);
      }

      return computed;
    }, [state]);

    const value = useMemo(
      () => ({
        state: { ...state, ...derivedState } as CombinedState<S, Sel>,
        actions: boundActions,
      }),
      [state, derivedState, boundActions],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useStore: StoreHook<S, A, Sel> = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        "useStore must be used within the corresponding Context Provider.",
      );
    }
    return [context.state, context.actions];
  };

  return [Provider, useStore];
}
