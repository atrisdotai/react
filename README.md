# @comet-labs/react

## About

Integrate [Comet](https://withcomet.com)'s Instant Wallet and Minting functionality into your React app in 1 line of code.

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

## Login with Comet

```javascript
import React from 'react';
import { CometButton } from '@comet-labs/react';

export default function MyApp(props) {
  // Login handler
  const loginHandler = (result) => {
    alert(`Logged in as @${result.username}! Address: ${result.address.address}`);
  }

  return (
    ...
    <CometButton
      action="login"
      onLoginthis ={loginHandler}
    />
    ...
  );
}
```

## Comet Gallery

```javascript
import React from 'react';
import { CometButton } from '@comet-labs/react';

export default function MyApp(props) {
  return (
    ...
    <CometButton
      action="gallery"
    />
    ...
  );
}
```

## Mint with Comet

Contact us to launch a new NFT and get its `collectionId`. Supports free mints
and paid mints using Stripe as an onramp.

```javascript
import React from 'react';
import { CometButton } from '@comet-labs/react';

export default function MyApp(props) {
  return (
    ...
    <CometButton
      action="mint"
      collectionId="<collectionId>"
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
| `onLogin` | :heavy_check_mark: | Handler function after the login is done. Contains fields for the user's `id`, `username`, and data about their `address`. |
| `chainType`, `chainId` | | Specify `chainType` and `chainId` to specify which blockchain to login with. The currently available `chainType`s and `chainId`s are listed below. |

### Supported chains
By default, Comet generates a wallet on **Solana mainnet**. To generate wallets on other chains, supply the `chainType` and `chainId` props to `CometButton`. The supported chains are listed below:

| Blockchain | `chainType` | `chainId` |
| --- | --- | --- |
| Solana mainnet | `solana` | 101 |
| Solana devnet | `solana` | 103 |
