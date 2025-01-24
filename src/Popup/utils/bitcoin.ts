import Big from 'big.js';
import type { Network, networks } from 'bitcoinjs-lib';
import { address as addressConverter, initEccLib, payments, Psbt, Transaction } from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';

import { BITCOIN_ADDRESS_TYPES } from '~/constants/bitcoin';
import type { BitcoinChain } from '~/types/chain';

import { minus, plus } from './big';

export function getAddress(publicKey: Buffer, addressType: 'p2tr' | 'p2pkh' | 'p2sh' | 'p2wpkh', network?: Network) {
  initBitcoinEcc();

  const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33));
  const tapInternalKey = toXOnly(publicKey);

  if (addressType === 'p2tr') {
    return payments.p2tr({
      internalPubkey: tapInternalKey,
      network,
    }).address!;
  }

  if (addressType === 'p2pkh') {
    return payments.p2pkh({ pubkey: publicKey, network }).address!;
  }

  if (addressType === 'p2sh') {
    return payments.p2sh({
      redeem: payments.p2wpkh({
        pubkey: publicKey,
        network,
      }),
    }).address!;
  }

  if (addressType === 'p2wpkh') {
    return payments.p2wpkh({ pubkey: publicKey, network }).address!;
  }

  return payments.p2wpkh({ pubkey: publicKey, network }).address!;
}

export function getAddressType(chain: BitcoinChain) {
  if (chain.bip44.purpose === BITCOIN_ADDRESS_TYPES.P2TR) {
    return 'p2tr';
  }

  if (chain.bip44.purpose === BITCOIN_ADDRESS_TYPES.P2PKH) {
    return 'p2pkh';
  }

  if (chain.bip44.purpose === BITCOIN_ADDRESS_TYPES.P2SH) {
    return 'p2sh';
  }

  if (chain.bip44.purpose === BITCOIN_ADDRESS_TYPES.P2WPKH) {
    return 'p2wpkh';
  }

  return 'p2wpkh';
}

export function formatPsbtHex(psbtHex: string) {
  let formatData = '';
  try {
    if (!/^[0-9a-fA-F]+$/.test(psbtHex)) {
      formatData = Psbt.fromBase64(psbtHex).toHex();
    } else {
      Psbt.fromHex(psbtHex);
      formatData = psbtHex;
    }
  } catch (e) {
    throw new Error('invalid psbt');
  }
  return formatData;
}

let isEccInit = false;

export function initBitcoinEcc() {
  if (!isEccInit) {
    initEccLib(ecc);
    isEccInit = true;
  }
}

export function scriptPkToAddress(scriptPk: string | Buffer, psbtNetwork: networks.Network) {
  initBitcoinEcc();
  try {
    const address = addressConverter.fromOutputScript(typeof scriptPk === 'string' ? Buffer.from(scriptPk, 'hex') : scriptPk, psbtNetwork);
    return address;
  } catch (e) {
    return '';
  }
}

export function decodedPsbt({ psbt, psbtNetwork }: { psbt: Psbt; psbtNetwork: networks.Network }) {
  const inputs = psbt.txInputs.map((input, index) => {
    const txid = Buffer.from(input.hash).reverse().toString('hex');
    let value: string | undefined;
    let script: Buffer | undefined;
    const v = psbt.data.inputs[index];
    if (v.witnessUtxo) {
      script = Buffer.from(v.witnessUtxo?.script);
      value = v.witnessUtxo?.value ? new Big(v.witnessUtxo?.value).toString() : undefined;
    } else if (v.nonWitnessUtxo) {
      const tx = Transaction.fromBuffer(v.nonWitnessUtxo);
      const output = tx.outs[input.index];
      script = Buffer.from(output.script);
      value = new Big(output.value).toString();
    }

    let address = '';
    if (script) {
      address = scriptPkToAddress(script, psbtNetwork);
    }

    return {
      txid,
      vout: input.index,
      value,
      address,
    };
  });

  const outputs = psbt.txOutputs.map((output) => {
    let address = '';
    try {
      address = scriptPkToAddress(Buffer.from(output.script), psbtNetwork);
    } catch (err) {
      //
    }

    return {
      address,
      value: new Big(output.value).toString(),
    };
  });

  const inputValue = inputs.reduce((sum, input) => plus(sum, input.value ?? '0'), '0');
  const outputValue = outputs.reduce((sum, output) => plus(sum, output.value), '0');
  const fee = minus(inputValue, outputValue);

  const result = {
    inputInfos: inputs,
    outputInfos: outputs,
    fee,
  };

  return result;
}
