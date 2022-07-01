<p align="center">
  <h1 align="center">cardano-dapp-js</h1>
  <p align="center">A library that enables websites to quickly become dApps using Javascript code.</p>
  <p align="center">
    <img src="https://img.shields.io/github/commit-activity/m/thaddeusdiamond/cardano-dapp-js?style=for-the-badge" />
    <a href="https://www.npmjs.com/package/cardano-dapp-js">
      <img src="https://img.shields.io/npm/v/cardano-dapp-js?style=for-the-badge" />
    </a>
    <a href="https://www.npmjs.com/package/cardano-dapp-js">
      <img src="https://img.shields.io/npm/dw/cardano-dapp-js?style=for-the-badge" />
    </a>
    <img src="https://img.shields.io/npm/l/cardano-dapp-js?style=for-the-badge" />
    <a href="https://twitter.com/wildtangz">
      <img src="https://img.shields.io/twitter/follow/wildtangz?style=for-the-badge&logo=twitter" />
    </a>
  </p>
</p>

## Quickstart

Recommend prerequisites for running a local NPM webapp:

* [node](https://nodejs.org/en/download/)>=16.15.1
* [npm](https://www.npmjs.com/package/npm)>=8.12.0
* [static-server](https://www.npmjs.com/package/static-server)>=2.2.1 (for local serving)

### Basic usage

See [cardano-nft-js-toolkit](https://github.com/thaddeusdiamond/cardano-nft-mint-frontend) for full dApp examples.

First, you need to create a simple div to contain the wallet picker:

```html
<div id="wallet-container"></div>
```

Then, in a script block use JavaScript to initialize the wallet container and wire up the wallet picker users will use in your dApp.

```js
var cardanoDApp = new CardanoDApp('wallet-container');
```

The wallet returned from calls to this class conforms to [CIP-0030](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/cip-0030/).  Sample usage could be:

```js
if (!cardanoDApp.isWalletConnected()) {
  alert('Please connect a wallet to access this dApp!');
  return;
}

cardanoDApp.getConnectedWallet().then(wallet => {
  var Blockfrost = new Blockfrost(BLOCKFROST_BASE, BLOCKFROST_KEY);
  Lucid.new(Blockfrost, NETWORK).then(lucid => {
    lucid.selectWallet(wallet);
    lucid.newTx().payToAddress(paymentAddr, { lovelace: paymentAmount }).complete();
    // ...
  });
});
```

### Styling

The dropdown menu created by the initialization of the CardanoDApp facilitates unique styling through HTML/CSS identifiers.  A simple CSS stylesheet for testing can be found at [cardano-wallet-picker.css](./src/css/cardano-wallet-picker.css) and can be included as:

```html
<link href="https://cdn.jsdelivr.net/npm/cardano-dapp-js@1.0.0/src/css/cardano-wallet-picker.css" rel="stylesheet" integrity="sha384-jeqm08LTVeNbS97UWy4EXaCioonM70aAFwSpoQITuPKgc53EI0+XfxoG+0hwMLqj" crossorigin="anonymous" type="text/css">
```

## Installation
While this code can be built directly into Javascript (using a tool like [Webpack](https://webpack.js.org/guides/getting-started/)), we recommend building your HTML5 webapp using [npm](https://npmjs.org/).  Then, you can install this package using:

    npm install cardano-dapp-js

### From Source

First, clone this repository and install all dependencies:

    npm install

Then, create the ability for npm to link on your local system:

    npm link

Finally, go to your project directory and use `npm link` to create a symlink:

    cd $PROJECT_DIR/node_modules
    npm link cardano-dapp-js

When you build your web application, you will be using a locally symlinked version of this library.

### Compatibility

This library is built to be compatible with any wallet that is aligned to [CIP-0030](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/cip-0030/) (the full list can be found at [cardano-caniuse.io](https://www.cardano-caniuse.io/)).

While not required, we highly recommend integrating this library with [Lucid by Berry-Pool](https://github.com/Berry-Pool/lucid) for creating and submitting transactions on Cardano.

## Testing

TBA

## Documentation

TBA
