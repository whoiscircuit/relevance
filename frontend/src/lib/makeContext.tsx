import {
  createContext as createReactContext,
  useContext,
  useState,
} from "react";

type Selector<TState, TValue> = (state: TState) => TValue;

interface MakeContextOptions<TState, TActions extends Record<string, any>> {
  state: TState;
  actions: {
    [K in keyof TActions]: (state: TState, ...args: any[]) => void | TState;
  };
  selectors?: {
    [key: string]: Selector<TState, any>;
  };
}

interface ContextValue<TState, TSelectors extends Record<string, any>> {
  state: TState & TSelectors;
  actions: Record<string, any>;
}

export function makeContext<
  TState extends Record<string, any>,
  TActions extends Record<string, any>,
  TSelectors extends Record<string, any> = {},
>(options: MakeContextOptions<TState, TActions>) {
  const { state: initialState, actions, selectors = {} } = options;

  const Context = createReactContext<
    ContextValue<TState, TSelectors> | undefined
  >(undefined);

  const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [state, setState] = useState<TState>(initialState);

    // Create bound actions
    const boundActions: Record<string, any> = {};
    for (const [key, action] of Object.entries(actions)) {
      boundActions[key] = (...args: any[]) => {
        const result = action(state, ...args);
        if (result !== undefined) {
          setState(result);
        }
      };
    }

    // Create computed selectors
    const computedSelectors: TSelectors = {} as TSelectors;
    for (const [key, selector] of Object.entries(selectors)) {
      computedSelectors[key as keyof TSelectors] = selector(state);
    }

    const value: ContextValue<TState, TSelectors> = {
      state: { ...state, ...computedSelectors },
      actions: boundActions,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useContextHook = (): [
    state: TState & TSelectors,
    actions: Record<string, any>,
  ] => {
    const context = useContext(Context);
    if (!context) {
      throw new Error("useContext must be used within the ContextProvider");
    }
    return [context.state, context.actions];
  };

  return [ContextProvider, useContextHook] as const;
}
