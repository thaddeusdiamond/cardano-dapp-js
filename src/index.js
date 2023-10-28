import {Lucid, Blockfrost, C as LCore} from 'lucid-cardano';
import Toastify from 'toastify-js';

import {coreToUtxo, fromHex} from 'lucid-cardano';

import {
  init as walletConnectInit,
  connect as walletConnect,
  getActiveConnector as getActiveWalletConnectConnector,
  cardanoMainnetWalletConnect,
  WalletConnectConnector
} from '@dcspark/adalib';

export {Lucid, Blockfrost};

export class CardanoDApp {

  static #CARDANO_CHAINS = [
    cardanoMainnetWalletConnect()
  ];

  static SUPPORTED_WALLETS = {
    eternl: {
      cip30name: 'eternl',
      img: 'https://ccvault.io/icons/favicon-128x128.png'
    },
    flint: {
      cip30name: 'flint',
      img: 'https://flint-wallet.com/favicon.png'
    },
    gero: {
      cip30name: 'gerowallet',
      img: 'https://gerowallet.io/assets/img/logo2.ico'
    },
    lace: {
      cip30name: 'lace',
      img: 'https://www.lace.io/favicon-32x32.png'
    },
    nami: {
      cip30name: 'nami',
      img: 'https://namiwallet.io/favicon-32x32.png'
    },
    typhon: {
      cip30name: 'typhoncip30',
      img: 'https://typhonwallet.io/assets/typhon.svg',
    },
    vespr: {
      cip30name: 'vespr',
      img: 'https://vespr.xyz/favicon.png'
    },
    WalletConnect: {
      cip30name: 'WalletConnect',
      img: 'https://cloud.walletconnect.com/favicon.ico'
    },
    yoroi: {
      cip30name: 'yoroi',
      img: 'https://yoroi-wallet.com/assets/favicon.png'
    }
  }

  static #TIMEOUT_MS = 1000;

  static #toastWalletError(error) {
    var message = error.toString();
    if (error.constructor === Object) {
      message = JSON.stringify(error);
    }
    Toastify({text: `Wallet error occurred: ${message}`, duration: 3000}).showToast();
  }

  static #isWalletSupported(walletName) {
    const walletCip30Name = CardanoDApp.SUPPORTED_WALLETS[walletName].cip30name;
    if (!(("cardano" in window) && (walletCip30Name in window.cardano))) {
      this.#toastWalletError(`Wallet '${walletName}' not integrated in your browser`);
      return false;
    }
    return true;
  }

  static async #enableWallet(walletName) {
    if (walletName === 'WalletConnect') {
      const connector = getActiveWalletConnectConnector();
      const isStillConnected = await connector.isConnected(CardanoDApp.#TIMEOUT_MS);
      if (!isStillConnected) {
        await walletConnect();
      }
      return connector.getConnectorAPI();
    }
    const cip30name = CardanoDApp.SUPPORTED_WALLETS[walletName].cip30name;
    return window.cardano[cip30name].enable();
  }

  static #configureWalletConnect(walletConnectInfo) {
    walletConnectInit(() => {
      return {
        connectors: [
          new WalletConnectConnector({
            relayerRegion: walletConnectInfo.relayerRegion,
            metadata: walletConnectInfo.metadata,
            autoconnect: walletConnectInfo.autoconnect,
            qrcode: true
          })
        ],
        connectorName: WalletConnectConnector.connectorName(),
        chosenChain: cardanoMainnetWalletConnect()
      }
    }, walletConnectInfo.projectId);
  }

  constructor(containerId, walletConnectInfo) {
    this.containerId = containerId;
    this.#buildDropdownDom();
    if (walletConnectInfo !== undefined) {
      CardanoDApp.#configureWalletConnect(walletConnectInfo);
      window.cardano.WalletConnect = walletConnectInfo;
    }
    this.#configureDropdownListeners();
  }

  #buildDropdownDom() {
    var dropdownHtml = `<ul><li><a id="${this.#getBannerEl()}" class="text-reset bordered">Connect Wallet&nbsp;&#9660;</a>`;
    dropdownHtml += '<ul class="dropdown">';
    for (var wallet in CardanoDApp.SUPPORTED_WALLETS) {
      var img = CardanoDApp.SUPPORTED_WALLETS[wallet].img;
      dropdownHtml += `<li class="bordered"><a id="${this.containerId}-${wallet}"><img src="${img}" width=20 height=20 />&nbsp;&nbsp;${wallet}</a></li>`;
    }
    dropdownHtml += '</ul></li></ul>';
    document.querySelector(`#${this.containerId}`).innerHTML = dropdownHtml;
  }

  #configureDropdownListeners() {
    for (const wallet in CardanoDApp.SUPPORTED_WALLETS) {
      document.querySelector(`#${this.containerId}-${wallet}`).addEventListener("click", async e => {
        e && e.preventDefault();
        await this.connectWallet(wallet);
      });
    }
  }

  #getBannerEl() {
    return `${this.containerId}-header`;
  }

  async connectWallet(walletName) {
    if (!CardanoDApp.#isWalletSupported(walletName)) {
      return;
    }

    try {
      const wallet = await CardanoDApp.#enableWallet(walletName);
      const address = await wallet.getChangeAddress();
      this.selectedWallet = walletName;
      this.#displayWallet();
      Toastify({
          text: `Successfully connected wallet ${address}!`,
          duration: 3000
      }).showToast();
      window.postMessage({
        type: "CARDANO_DAPP_JS_CONNECT",
        wallet: { provider: walletName, address: address }
      }, "*");
    } catch (err) {
      CardanoDApp.#toastWalletError(err);
    }
  }

  #displayWallet() {
    if (this.isWalletConnected() && this.containerId) {
      document.querySelector(`#${this.#getBannerEl()}`).textContent = `Connected to ${this.selectedWallet}!`;
    }
  }

  getConnectedWallet() {
    if (this.selectedWallet === undefined) {
      throw 'No wallet connected to enable';
    }
    return CardanoDApp.#enableWallet(this.selectedWallet);
  }

  async numPolicyAssets(policy) {
    const policyAssets = {};
    const currentWallet = await this.getConnectedWallet();
    const utxos = await currentWallet.getUtxos();
    for (const utxoStr of utxos) {
      const utxoBytes = fromHex(utxoStr);
      const coreUtxo = LCore.TransactionUnspentOutput.from_bytes(utxoBytes);
      const utxo = coreToUtxo(coreUtxo)
      const assets = utxo.assets;
      for (const asset in assets) {
        if (asset.startsWith(policy)) {
          policyAssets[asset] = assets[asset];
        }
      }
    }
    return Object.values(policyAssets).reduce((acc, amount) => acc + amount, 0n);
  }

  async walletMeetsTokenGate(tokenGateMap) {
    for (const policy in tokenGateMap) {
      const numPolicyAssets = await this.numPolicyAssets(policy);
      if (numPolicyAssets >= tokenGateMap[policy]) {
        return true;
      }
    }
    return false;
  }

  isWalletConnected() {
    return this.selectedWallet !== undefined;
  }

}
