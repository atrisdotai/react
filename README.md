# @comet-labs/react

## About

Integrate [Comet](https://withcomet.com)'s Instant Wallet into your React app in 1 line of code.

**Note: This is a very early release of Comet's React library and APIs are subject to change.**

## Installation

### npm
```
npm install --save @comet-labs/react
```

### yarn
```
yarn add @comet-labs/react
```

## Usage

```javascript
import React from 'react';
import { CometButton } from '@comet-labs/react';

// Import CSS to apply styles
import '@comet-labs/react/dist/index.css';

export default function MyApp(props) {
  // Login handler
  const loginHandler = (result) => {
    alert(`Logged in as @${result.username}! Address: ${result.address.address}`);
  }

  return (
    ...
    <CometButton
      action="login"
      onSuccess={loginHandler}
    />
    ...
  );
}
```

### API
`CometButton` accepts the following props:

| Prop | Required | Description |
| --- | --- | --- |
| `action` | :heavy_check_mark: | The action that occurs when the button is clicked. Currently the only accepted action is `login`. |
| `onSuccess` | :heavy_check_mark: | Handler function after the login is done. Contains fields for the user's `id`, `username`, and data about their `address`. |
| `chainType`, `chainId` | | Specify `chainType` and `chainId` to specify which blockchain to login with. The currently available `chainType`s and `chainId`s are listed below. |

### Supported chains
By default, Comet generates a wallet on **Solana mainnet**. To generate wallets on other chains, supply the `chainType` and `chainId` props to `CometButton`. The supported chains are listed below:

| Blockchain | `chainType` | `chainId` |
| --- | --- | --- |
| Solana mainnet | `solana` | 101 |
| Solana devnet | `solana` | 103 |
| Ethereum mainnet | `evm` | 1 |
| Rinkeby testnet | `evm` | 4 |
| Polygon mainnet | `evm` | 137 |
| Mumbai testnet | `evm` | 80001 |
