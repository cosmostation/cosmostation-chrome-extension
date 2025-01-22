import { AptosAccount, derivePath } from 'aptos';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import { crypto, initEccLib } from 'bitcoinjs-lib';
import aes from 'crypto-js/aes';
import encHex from 'crypto-js/enc-hex';
import encUtf8 from 'crypto-js/enc-utf8';
import baseSha512 from 'crypto-js/sha512';
import { ECPairFactory, networks } from 'ecpair';
import * as TinySecp256k1 from 'tiny-secp256k1';
import * as ecc from '@bitcoinerlab/secp256k1';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import type { Chain } from '~/types/chain';
import type { Account } from '~/types/extensionStorage';

const bip32 = BIP32Factory(TinySecp256k1);
const ECPair = ECPairFactory(TinySecp256k1);

export function ecpairFromPrivateKey(privateKey: Buffer) {
  return ECPair.fromPrivateKey(privateKey);
}

export function ecpairFromPublicKey(publicKey: Buffer) {
  return ECPair.fromPublicKey(publicKey);
}

export function sha512(message: string) {
  return baseSha512(message).toString(encHex);
}

export function aesEncrypt(message: string, key: string) {
  return aes.encrypt(message, key).toString();
}

export function aesDecrypt(message: string, key: string) {
  return aes.decrypt(message, key).toString(encUtf8);
}

const PRIVATE_KEY_SIZE = 32;
const BN32_ZERO = new Uint8Array(32);
const BN32_N = new Uint8Array([
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 186, 174, 220, 230, 175, 72, 160, 59, 191, 210, 94, 140, 208, 54, 65, 65,
]);

export function isPrivate(x: Uint8Array): boolean {
  return isUint8Array(x) && x.length === PRIVATE_KEY_SIZE && cmpBN32(x, BN32_ZERO) > 0 && cmpBN32(x, BN32_N) < 0;
}

function isUint8Array(value: Uint8Array): boolean {
  return value instanceof Uint8Array;
}

function cmpBN32(data1: Uint8Array, data2: Uint8Array): number {
  for (let i = 0; i < 32; i += 1) {
    if (data1[i] !== data2[i]) {
      return data1[i] < data2[i] ? -1 : 1;
    }
  }
  return 0;
}

export function mnemonicToPair(mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(path);

  return { privateKey: child.privateKey!, publicKey: child.publicKey };
}

function tapTweakHash(xOnlyPubkey: Buffer, tweakHash: Buffer | null): Buffer {
  return crypto.taggedHash('TapTweak', Buffer.concat(tweakHash ? [xOnlyPubkey, tweakHash] : [xOnlyPubkey]));
}

export function getTweakSigner(
  account: Account,
  chain: Chain,
  password: string | null,
  opts: { tweakHash?: Buffer | null; network?: 'mainnet' | 'testnet' | 'regtest' },
) {
  if (password === null) return null;

  const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33));

  if (account.type === 'MNEMONIC') {
    const bip32Instance = BIP32Factory(ecc);

    const mnemonic = aesDecrypt(account.encryptedMnemonic, password);
    const path = `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}`;

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32Instance.fromSeed(seed);
    const child = node.derivePath(path);

    const childNodeXOnlyPubkey = toXOnly(child.publicKey);

    const tweakedChildNode = child.tweak(crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));

    return tweakedChildNode;
  }
  if (account.type === 'PRIVATE_KEY') {
    initEccLib(ecc);

    const ECPairInstance = ECPairFactory(ecc);

    const privateKey = Buffer.from(aesDecrypt(account.encryptedPrivateKey, password), 'hex');

    let derivedPrivateKey = new Uint8Array(privateKey);
    const keypair = ECPairInstance.fromPrivateKey(privateKey, {
      compressed: true,
    });

    if (keypair.publicKey[0] === 3) {
      derivedPrivateKey = ecc.privateNegate(derivedPrivateKey);
    }

    const tweakedPrivateKey = ecc.privateAdd(derivedPrivateKey, tapTweakHash(toXOnly(keypair.publicKey), opts.tweakHash || null));

    derivedPrivateKey = tweakedPrivateKey!;

    if (!derivedPrivateKey) {
      throw new Error('Invalid tweak or private key');
    }

    return ECPairInstance.fromPrivateKey(Buffer.from(derivedPrivateKey), {
      network: opts.network === 'mainnet' ? networks.bitcoin : networks.testnet,
    });
  }
  return null;
}

export function mnemonicToAptosPair(mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = derivePath(path, Buffer.from(seed).toString('hex'));
  const account = new AptosAccount(node.key);

  const privateKey = Buffer.from(node.key);
  const publicKey = Buffer.from(account.pubKey().toUint8Array());

  return { privateKey, publicKey };
}

export function mnemonicToSuiPair(mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = derivePath(path, Buffer.from(seed).toString('hex'));
  const account = new AptosAccount(node.key);

  const privateKey = Buffer.from(node.key);
  const publicKey = Buffer.from(account.pubKey().toUint8Array());

  return { privateKey, publicKey };
}

export function privateKeyToPair(privateKey: Buffer) {
  const ecpair = ECPair.fromPrivateKey(privateKey, {
    compressed: true,
  });

  return { privateKey, publicKey: ecpair.publicKey };
}

export function privateKeyToAptosPair(privateKey: Buffer) {
  const account = new AptosAccount(privateKey);
  const publicKey = Buffer.from(account.pubKey().toUint8Array());

  return { privateKey, publicKey };
}

export function privateKeyToSuiPair(privateKey: Buffer) {
  const keypair = Ed25519Keypair.fromSecretKey(privateKey);

  return { privateKey, publicKey: Buffer.from(keypair.getPublicKey().toRawBytes()) };
}
