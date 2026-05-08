import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import type { networks as BitcoinNetwork, Signer as BitcoinLibSigner } from 'bitcoinjs-lib';
import { address as addressConverter, crypto, initEccLib, Psbt, Transaction } from 'bitcoinjs-lib';
import { isTaprootInput, toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { ECPairFactory, networks } from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';

import type { Account } from '@/types/account';
import type { Chain } from '@/types/chain';
import type { SignPsbtOptions } from '@/types/message/inject/bitcoin';

import { aesDecrypt } from '../crypto';
import { devLogger } from '../devLogger';
import { minus, plus } from '../numbers';

let isEccInit = false;

const ECPairInstance = ECPairFactory(ecc);
const bip32Instance = BIP32Factory(ecc);

export function initBitcoinEcc() {
  if (!isEccInit) {
    initEccLib(ecc);
    isEccInit = true;
  }
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
  } catch {
    throw new Error('invalid psbt');
  }
  return formatData;
}

export function scriptPkToAddress(scriptPk: string | Buffer, psbtNetwork: BitcoinNetwork.Network) {
  try {
    initBitcoinEcc();

    const address = addressConverter.fromOutputScript(typeof scriptPk === 'string' ? Buffer.from(scriptPk, 'hex') : scriptPk, psbtNetwork);

    return address;
  } catch {
    return '';
  }
}

export function decodedPsbt({ psbt, psbtNetwork }: { psbt: Psbt; psbtNetwork: BitcoinNetwork.Network }) {
  const inputs = psbt.txInputs.map((input, index) => {
    const txid = Buffer.from(input.hash).reverse().toString('hex');
    let value: string | undefined;
    let script: Buffer | undefined;
    const v = psbt.data.inputs[index];
    if (v.witnessUtxo) {
      script = Buffer.from(v.witnessUtxo?.script);
      value = v.witnessUtxo?.value ? BigInt(v.witnessUtxo?.value).toString() : undefined;
    } else if (v.nonWitnessUtxo) {
      const tx = Transaction.fromBuffer(v.nonWitnessUtxo);
      const output = tx.outs[input.index];
      script = Buffer.from(output.script);
      value = BigInt(output.value).toString();
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
    } catch {
      return undefined;
    }

    return {
      address,
      value: BigInt(output.value).toString(),
    };
  });

  const inputValue = inputs.reduce((sum, input) => plus(sum, input.value ?? '0'), '0');
  const outputValue = outputs.reduce((sum, output) => plus(sum, output?.value || '0'), '0');
  const fee = minus(inputValue, outputValue);

  const result = {
    inputInfos: inputs,
    outputInfos: outputs,
    fee,
  };

  return result;
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

  const { accountTypes } = chain;

  if (accountTypes.length === 0) {
    throw new Error('Invalid account type');
  }

  const accountType = accountTypes[0];

  if (account.type === 'MNEMONIC') {
    const { encryptedMnemonic, index } = account;
    const { hdPath } = accountType;

    const mnemonic = aesDecrypt(encryptedMnemonic, password);
    const path = hdPath.replace('${index}', `${index}`);

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32Instance.fromSeed(seed);
    const child = node.derivePath(path);

    const childNodeXOnlyPubkey = toXOnly(Buffer.from(child.publicKey));

    const tweakedChildNode = child.tweak(crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));

    const BitcoinLibSigner: BitcoinLibSigner = {
      ...tweakedChildNode,
      publicKey: Buffer.from(tweakedChildNode.publicKey),
      sign: (hash, lowR) => {
        const signature = tweakedChildNode.sign(hash, lowR);
        return Buffer.from(signature);
      },
      signSchnorr: (hash) => {
        const signature = tweakedChildNode.signSchnorr(hash);
        return Buffer.from(signature);
      },
    };

    return BitcoinLibSigner;
  }
  if (account.type === 'PRIVATE_KEY') {
    initEccLib(ecc);

    const privateKey = Buffer.from(aesDecrypt(account.encryptedPrivateKey, password), 'hex');

    let derivedPrivateKey = new Uint8Array(privateKey);
    const keypair = ECPairInstance.fromPrivateKey(privateKey, {
      compressed: true,
    });

    if (keypair.publicKey[0] === 3) {
      derivedPrivateKey = new Uint8Array(ecc.privateNegate(derivedPrivateKey));
    }

    const tweakedPrivateKey = ecc.privateAdd(derivedPrivateKey, tapTweakHash(toXOnly(Buffer.from(keypair.publicKey)), opts.tweakHash || null));

    if (tweakedPrivateKey) {
      derivedPrivateKey = new Uint8Array(tweakedPrivateKey);
    }

    if (!derivedPrivateKey) {
      throw new Error('Invalid tweak or private key');
    }

    const signer = ECPairInstance.fromPrivateKey(derivedPrivateKey, {
      network: opts.network === 'mainnet' ? networks.bitcoin : networks.testnet,
    });

    const BitcoinLibSigner: BitcoinLibSigner = {
      ...signer,
      publicKey: Buffer.from(signer.publicKey),
      sign: (hash, lowR) => {
        const signature = signer.sign(hash, lowR);
        return Buffer.from(signature);
      },
      signSchnorr: (hash) => {
        const signature = signer.signSchnorr(hash);
        return Buffer.from(signature);
      },
    };

    return BitcoinLibSigner;
  }
  return null;
}

export function ecpairFromPrivateKey(privateKey: string) {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  const ECPairInterface = ECPairInstance.fromPrivateKey(privateKeyBuffer);

  const BitcoinLibSigner: BitcoinLibSigner = {
    ...ECPairInterface,
    publicKey: Buffer.from(ECPairInterface.publicKey),
    sign: (hash, lowR) => {
      const signature = ECPairInterface.sign(hash, lowR);
      return Buffer.from(signature);
    },
    signSchnorr: (hash) => {
      const signature = ECPairInterface.signSchnorr(hash);
      return Buffer.from(signature);
    },
  };
  return BitcoinLibSigner;
}

export function ecpairInstanceFromPrivateKey(privateKey: string) {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  const EcPairInstance = ECPairInstance.fromPrivateKey(privateKeyBuffer);

  return EcPairInstance;
}

export function ecpairFromPublicKey(publicKey: string) {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');

  return ECPairInstance.fromPublicKey(publicKeyBuffer);
}

export function isValidBitcoinTx(txHex: string) {
  try {
    const tx = Transaction.fromHex(txHex);

    if (tx.ins.length === 0 || tx.outs.length === 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

const isTaprootAddress = (address: string): boolean => address.startsWith('bc1p') || address.startsWith('tb1p');

export function getInputsToSign({
  psbt,
  options,
  keyPairPublicKey,
  accountAddress,
  bitcoinNetwork,
}: {
  psbt: Psbt;
  options?: SignPsbtOptions;
  keyPairPublicKey?: string;
  accountAddress?: string;
  bitcoinNetwork: BitcoinNetwork.Network;
}): {
  index: number;
  publicKey: string;
  address: string;
  sighashTypes?: number[];
  disableTweakSigner?: boolean;
  useTweakedSigner?: boolean;
}[] {
  if (Array.isArray(options?.toSignInputs) && options.toSignInputs.length > 0) {
    return options.toSignInputs.map((input) => ({
      index: input.index,
      publicKey: input.publicKey || keyPairPublicKey || '',
      address: input.address || accountAddress || '',
      sighashTypes: input.sighashTypes,
      disableTweakSigner: input.disableTweakSigner,
      useTweakedSigner: input.useTweakedSigner,
    }));
  }

  const result: {
    index: number;
    publicKey: string;
    address: string;
    sighashTypes?: number[];
    disableTweakSigner?: boolean;
    useTweakedSigner?: boolean;
  }[] = [];

  psbt.data.inputs.forEach((input, index) => {
    let inputAddress = '';

    if (input.witnessUtxo) {
      const scriptPubKey = input.witnessUtxo.script;
      try {
        inputAddress = addressConverter.fromOutputScript(scriptPubKey, bitcoinNetwork);
      } catch {
        // empty
      }
    } else if (input.nonWitnessUtxo) {
      const tx = Transaction.fromBuffer(input.nonWitnessUtxo);
      const output = tx.outs[psbt.txInputs[index].index];
      try {
        inputAddress = addressConverter.fromOutputScript(output.script, bitcoinNetwork);
      } catch {
        // empty
      }
    }

    const isSigned = input.finalScriptSig || input.finalScriptWitness;

    if (inputAddress === accountAddress && !isSigned && keyPairPublicKey && accountAddress) {
      result.push({
        index,
        publicKey: keyPairPublicKey,
        address: accountAddress,
        sighashTypes: input.sighashType ? [input.sighashType] : undefined,
      });

      if (isTaprootAddress(accountAddress) && !input.tapInternalKey) {
        input.tapInternalKey = toXOnly(Buffer.from(keyPairPublicKey, 'hex'));
      }
    }
  });

  return result;
}

export function signPsbtInputs({
  psbt,
  inputsToSign,
  signer,
  tweakSigner,
}: {
  psbt: Psbt;
  inputsToSign: {
    index: number;
    sighashTypes?: number[];
    disableTweakSigner?: boolean;
    useTweakedSigner?: boolean;
  }[];
  signer: BitcoinLibSigner;
  tweakSigner: BitcoinLibSigner | null;
}): void {
  inputsToSign.forEach((inputToSign) => {
    const { index, disableTweakSigner, useTweakedSigner, sighashTypes } = inputToSign;
    const input = psbt.data.inputs[index];

    if (!input) {
      devLogger.warn(`Input at index ${index} not found`);
      return;
    }

    if (isTaprootInput(input)) {
      let needTweak = true;

      if (typeof useTweakedSigner === 'boolean') {
        needTweak = useTweakedSigner;
      } else if (disableTweakSigner) {
        needTweak = false;
      } else if (input.tapLeafScript && input.tapLeafScript?.length > 0 && !input.tapMerkleRoot) {
        input.tapLeafScript.forEach((e) => {
          if (e.controlBlock && e.script) {
            needTweak = false;
          }
        });
      }

      if (needTweak) {
        if (!tweakSigner) {
          throw new Error('Tweak signer is required for taproot input');
        }
        psbt.signInput(index, tweakSigner, sighashTypes);
      } else {
        psbt.signInput(index, signer, sighashTypes);
      }
    } else {
      psbt.signInput(index, signer, sighashTypes);
    }
  });
}

export function signAndFinalizePsbt({
  psbt,
  inputsToSign,
  signer,
  tweakSigner,
  autoFinalized = true,
}: {
  psbt: Psbt;
  inputsToSign: {
    index: number;
    sighashTypes?: number[];
    disableTweakSigner?: boolean;
    useTweakedSigner?: boolean;
  }[];
  signer: BitcoinLibSigner;
  tweakSigner: BitcoinLibSigner | null;
  autoFinalized?: boolean;
}): string {
  signPsbtInputs({ psbt, inputsToSign, signer, tweakSigner });

  if (autoFinalized) {
    return psbt.finalizeAllInputs().toHex();
  } else {
    return psbt.toHex();
  }
}
