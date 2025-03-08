import { bech32 } from 'bech32';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import { networks, payments } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import { ECPairFactory } from 'ecpair';
import { derivePath, getPublicKey } from 'ed25519-hd-key';
import { Address, toChecksumAddress } from 'ethereumjs-util';
import { SHA3 } from 'sha3';
import ecc from '@bitcoinerlab/secp256k1';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';

import type { Account } from '@/types/account';
import type { Chain } from '@/types/chain';
import { initBitcoinEcc } from '@/utils/bitcoin.ts/tx';
import { aesDecrypt } from '@/utils/crypto';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

interface Keypair {
  privateKey: string;
  publicKey: string;
}

export function getKeypair(chain: Chain, account: Account, password: string | null): Keypair {
  if (password === null) {
    throw new Error('Invalid password');
  }

  const { chainType, accountTypes } = chain;

  if (accountTypes.length === 0) {
    throw new Error('Invalid account type');
  }

  const accountType = accountTypes[0];
  if (account.type === 'MNEMONIC') {
    const { encryptedMnemonic, index } = account;
    const { hdPath } = accountType;

    const decryptedMnemonic = aesDecrypt(encryptedMnemonic, password);

    if (chainType === 'cosmos' || chainType === 'evm' || chainType === 'bitcoin') {
      const path = hdPath.replace('${index}', `${index}`);

      const seed = bip39.mnemonicToSeedSync(decryptedMnemonic);
      const node = bip32.fromSeed(seed);
      const child = node.derivePath(path);

      const privateKey = Buffer.from(child.privateKey!).toString('hex');
      const publicKey = Buffer.from(child.publicKey).toString('hex');

      return { privateKey, publicKey };
    }

    if (chainType === 'aptos' || chainType === 'sui') {
      const path = hdPath.replace('${index}', `${index}`);

      const seed = bip39.mnemonicToSeedSync(decryptedMnemonic);
      const node = derivePath(path, Buffer.from(seed).toString('hex'));

      const privateKey = Buffer.from(node.key).toString('hex');
      const publicKey = Buffer.from(getPublicKey(node.key, false)).toString('hex');

      return { privateKey, publicKey };
    }

    throw new Error('Invalid chain type');
  }

  if (account.type === 'PRIVATE_KEY') {
    const { encryptedPrivateKey } = account;
    const decryptedPrivateKey = aesDecrypt(encryptedPrivateKey, password);

    if (chainType === 'cosmos' || chainType === 'evm' || chainType === 'bitcoin') {
      const ecpair = ECPair.fromPrivateKey(Buffer.from(decryptedPrivateKey, 'hex'), {
        compressed: true,
      });

      return { privateKey: decryptedPrivateKey, publicKey: Buffer.from(ecpair.publicKey).toString('hex') };
    }
    if (chainType === 'aptos' || chainType === 'sui') {
      const publicKey = Buffer.from(getPublicKey(Buffer.from(decryptedPrivateKey, 'hex'), false)).toString('hex');
      return { privateKey: decryptedPrivateKey, publicKey };
    }

    throw new Error('Invalid chain type');
  }

  throw new Error('Invalid account type');
}

export function getAddress(chain: Chain, publicKey: string) {
  const { chainType, accountTypes } = chain;
  // FIXME 이 부분 getAccounts류 디앱 요청에서 에러날 가능성 있음.
  const accountType = accountTypes[0];
  if (chainType === 'cosmos') {
    const { accountPrefix } = chain;
    const { pubkeyStyle } = accountType;
    if (pubkeyStyle === 'keccak256') {
      const uncompressedPublicKey = Buffer.from(ecc.pointCompress(Buffer.from(publicKey, 'hex'), false).slice(1));
      const address = toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());

      const words = bech32.toWords(Buffer.from(address.substring(2), 'hex'));
      const result = bech32.encode(accountPrefix, words);

      return result;
    } else if (pubkeyStyle === 'secp256k1') {
      const encodedBySha256 = sha256(encHex.parse(publicKey)).toString(encHex);

      const encodedByRipemd160 = ripemd160(encHex.parse(encodedBySha256)).toString(encHex);

      const words = bech32.toWords(Buffer.from(encodedByRipemd160, 'hex'));
      const result = bech32.encode(accountPrefix, words);

      return result;
    }
  }

  if (chainType === 'aptos') {
    const sha3 = new SHA3(256);
    return `0x${Buffer.from(sha3.update(Buffer.from(publicKey, 'hex')).update('\x00').digest()).toString('hex')}`;
  }

  if (chainType === 'sui') {
    const ed25519PublicKey = new Ed25519PublicKey(Buffer.from(publicKey, 'hex'));

    return ed25519PublicKey.toSuiAddress();
  }

  if (chainType === 'evm') {
    const uncompressedPublicKey = Buffer.from(ecc.pointCompress(Buffer.from(publicKey, 'hex'), false).slice(1));
    const address = Address.fromPublicKey(uncompressedPublicKey).toString();
    return toChecksumAddress(address);
  }

  if (chainType === 'bitcoin') {
    initBitcoinEcc();

    const { pubkeyStyle } = accountType;

    const network = chain.isTestnet ? networks.testnet : networks.bitcoin;

    const tapInternalKey = toXOnly(Buffer.from(publicKey, 'hex'));

    if (pubkeyStyle === 'p2tr') {
      return payments.p2tr({
        internalPubkey: tapInternalKey,
        network,
      }).address!;
    }
    if (pubkeyStyle === 'p2wpkh') {
      const p2wpkh = payments.p2wpkh({ pubkey: Buffer.from(publicKey, 'hex'), network });
      return p2wpkh.address!;
    }
    if (pubkeyStyle === 'p2pkh') {
      const p2pkh = payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex'), network });
      return p2pkh.address!;
    }
    if (pubkeyStyle === 'p2wpkhSh') {
      const p2wpkhSh = payments.p2sh({
        redeem: payments.p2wpkh({
          pubkey: Buffer.from(publicKey, 'hex'),
          network,
        }),
      });
      return p2wpkhSh.address!;
    }
  }

  throw new Error('Invalid chain type');
}
