import Influx from 'influxdb-nodejs';

import config from '../config.json';

// const client = new Influx('https://ben:zaq12wsx@metrics.bitconch.org/Tokens');
const client = new Influx('http://' + config.username + ':' + config.password + '@' + config.influxdbIP + ':8086/Tokens');

export function writeNewTokenToInfluxdb(owner, tokenpubkey, node_host_ip) {
  if (node_host_ip == config.influxdbIP) {
    // i --> integer
    // s --> string
    // f --> float
    // b --> boolean
    const fieldSchema = {
      owner_pubkey: 's',
      token_pubkey: 's',
      token_account_pubkey: 's',
    };
    const tagSchema = {
      //
      type: ['token_asset', 'created_token'],
    };
    client.schema('created_tokens', fieldSchema, tagSchema, {
      // default is false
      stripUnknown: true,
    });
    client.write('created_tokens')
    .tag({
      type: 'created_token',
    })
    .field({
      owner_pubkey: owner,
      token_pubkey: tokenpubkey,
      token_account_pubkey: '',
    })
    .then(() => console.info('write point success'))
    .catch((err) => {alert(err.message);console.error;});
  }
  else{
    alert('influxdb IP did not match , please config your infludb ip address in src/config.json');
  }
}

export function writeTokenAssetToInfluxdb(owner, tokenpubkey, tokenaccountpubkey, node_host_ip) {
  if (node_host_ip == config.influxdbIP) {
    // i --> integer
    // s --> string
    // f --> float
    // b --> boolean
    const fieldSchema = {
      owner_pubkey: 's',
      token_pubkey: 's',
      token_account_pubkey: 's',
    };
    const tagSchema = {
      //
      type: ['token_asset', 'created_token'],
    };
    client.schema('token_asset', fieldSchema, tagSchema, {
      // default is false
      stripUnknown: true,
    });
    client.write('token_asset')
    .tag({
      type: 'token_asset',
    })
    .field({
      owner_pubkey: owner,
      token_pubkey: tokenpubkey,
      token_account_pubkey: tokenaccountpubkey,
    })
    .then(() => console.info('write point success'))
    .catch((err) => {alert(err.message);console.error;});
  }
  else {
    alert('influxdb IP did not match , please config your infludb ip address in src/config.json');
  }
}

export function getTokenAssetByOwnerPublicKey(obj, ownerpubkey, readPublicKeyFromFile) {
  client.query('token_asset')
  .where('owner_pubkey', ownerpubkey.toString())
  .where('type', 'token_asset')
  .then( async (res) =>
  {
    if (res.results[0].series) {
      var arr = res.results[0].series[0].values;
      await readPublicKeyFromFile(arr, obj);
    }
  }
  )
  .catch((err) => alert(err));
}

export function getNewTokenList(obj, ownerpubkey, readPublicKeyFromFile) {
  client.query('created_tokens')
  .where('owner_pubkey', ownerpubkey.toString(), '!=')
  .where('type', 'created_token')
  .then( async (res) =>
  {
    if (res.results[0].series) {
      var arr = res.results[0].series[0].values;
      await readPublicKeyFromFile(obj, arr);
    }
  }
  )
  .catch((err) => alert(err.message));
}

export function getAssetByOwnerPubKey(obj, ownerpubkey, setTokenAsset) {
  client.query('token_asset')
  .where('owner_pubkey', ownerpubkey.toString())
  .where('type', 'token_asset')
  .then( (res) =>
  {
    if (res.results[0].series) {
      var arr = res.results[0].series[0].values;
      setTokenAsset(obj, arr);
    }
  }
  )
  .catch((err) => alert(err));
}