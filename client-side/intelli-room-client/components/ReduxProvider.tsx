import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { loadAuthData } from "../store/authSlice";

interface ReduxProviderProps {
  children: React.ReactNode;
}

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  useEffect(() => {
    store.dispatch(loadAuthData());
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
