import localforage from 'localforage';
import EventEmitter from 'event-emitter';
import * as web3 from '@luhuimao/bitconch-web3j';

export class Store {
  constructor() {
    this._ee = new EventEmitter();
    this._lf = localforage.createInstance({
      name: 'configuration'
    });
  }

  async init() {
    for (let key of [
      'networkEntryPoint',
      'accountSecretKey', // TODO: THIS KEY IS NOT STORED SECURELY!!
    ]) {
      this[key] = await this._lf.getItem(key);
    }

    if (typeof this.networkEntryPoint !== 'string') {
      this.networkEntryPoint = 'http://47.75.189.25:10099';
    }

    if (!this.accountSecretKey) {
      await this.createAccount();
      return;
    }
    this._ee.emit('change');
  }

  async createAccount() {
    const account = new web3.BusAccount();
    this.accountSecretKey = account.privateKey;
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', account.privateKey);
  }

  async exportAccount(value) {
    this.accountSecretKey = value;//密钥
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', value);
  }

  async setNetworkEntryPoint(value) {
    this.networkEntryPoint = value;
    this._ee.emit('change');
    await this._lf.setItem('networkEntryPoint', value);
  }

  onChange(fn) {
    this._ee.on('change', fn);
  }

  removeChangeListener(fn) {
    this._ee.off('change', fn);
  }

}

