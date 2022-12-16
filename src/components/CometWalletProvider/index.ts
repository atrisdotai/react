
import * as React from 'react';

const CometWalletContext = React.createContext({});

interface CometWalletState {

};

export default function CometWalletProvider({
  children,
}: React.PropsWithChildren<React.ProviderProps<CometWalletState>>) {
  return React.createElement(
    CometWalletContext.Provider,
    {
      children,
      value: 4235,
    },
  );
}
