import {Lucid, Blockfrost} from "lucid-cardano";
import Toastify from 'toastify-js';

export {Lucid, Blockfrost};

export class CardanoDApp {

  static #SUPPORTED_WALLETS = {
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
    nami: {
      cip30name: 'nami',
      img: 'https://namiwallet.io/favicon-32x32.png'
    },
    typhon: {
      cip30name: 'typhoncip30',
      img: 'https://typhonwallet.io/assets/typhon.svg',
    },
    yoroi: {
      cip30name: 'yoroi',
      img: 'https://yoroi-wallet.com/assets/favicon.png'
    }
  }

  static #toastWalletError(error) {
    var message = error.toString();
    if (error.constructor === Object) {
      message = JSON.stringify(error);
    }
    Toastify({text: `Wallet error occurred: ${message}`, duration: 3000}).showToast();
  }

  static #isWalletSupported(walletName) {
    const walletCip30Name = CardanoDApp.#SUPPORTED_WALLETS[walletName].cip30name;
    if (!(("cardano" in window) && (walletCip30Name in window.cardano))) {
      this.#toastWalletError(`Wallet '${walletName}' not integrated in your browser`);
      return false;
    }
    return true;
  }

  static #enableWallet(walletName) {
    const cip30name = CardanoDApp.#SUPPORTED_WALLETS[walletName].cip30name;
    return window.cardano[cip30name].enable();
  }

  constructor(containerId) {
    this.containerId = containerId;
    this.#buildDropdownDom();
    this.#configureDropdownListeners();
  }

  #buildDropdownDom() {
    var dropdownHtml = `<ul><li><a id="${this.#getBannerEl()}" class="text-reset bordered">Connect Wallet&nbsp;&#9660;</a>`;
    dropdownHtml += '<ul class="dropdown">';
    for (var wallet in CardanoDApp.#SUPPORTED_WALLETS) {
      var img = CardanoDApp.#SUPPORTED_WALLETS[wallet].img;
      dropdownHtml += `<li class="bordered"><a id="${this.containerId}-${wallet}"><img src="${img}" width=20 height=20 />&nbsp;&nbsp;${wallet}</a></li>`;
    }
    dropdownHtml += '</ul></li></ul>';
    document.querySelector(`#${this.containerId}`).innerHTML = dropdownHtml;
  }

  #configureDropdownListeners() {
    for (const wallet in CardanoDApp.#SUPPORTED_WALLETS) {
      document.querySelector(`#${this.containerId}-${wallet}`).addEventListener("click", e => this.connectWallet(e, wallet));
    }
  }

  #getBannerEl() {
    return `${this.containerId}-header`;
  }

  connectWallet(e, walletName) {
    e.preventDefault();
    if (!CardanoDApp.#isWalletSupported(walletName)) {
      return;
    }

    CardanoDApp.#enableWallet(walletName).then(wallet =>
      wallet.getChangeAddress().then(address => {
        this.selectedWallet = walletName;
        this.#displayWallet();
        Toastify({
            text: `Successfully connected wallet ${address}!`,
            duration: 3000
        }).showToast();
      })
    ).catch(CardanoDApp.#toastWalletError);
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

  isWalletConnected() {
    return this.selectedWallet !== undefined;
  }

}
