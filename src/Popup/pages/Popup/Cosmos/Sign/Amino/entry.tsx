import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import secp256k1 from 'secp256k1';
import sortKeys from 'sort-keys';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Fee from '~/Popup/components/Fee';
import LedgerToPopup from '~/Popup/components/Loading/LedgerToPopup';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { fix, lt, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, getPublicKeyType, signAmino } from '~/Popup/utils/cosmos';
import CosmosApp from '~/Popup/utils/ledger/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, protoTx } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, FeeCoin } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { CosSignAmino, CosSignAminoResponse } from '~/types/message/cosmos';

import TxMessage from './components/TxMessage';
import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, FeeContainer, MemoContainer, PaginationContainer, TabContainer } from './styled';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';

type EntryProps = {
  queue: Queue<CosSignAmino>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const [value, setValue] = useState(0);
  const [txMsgPage, setTxMsgPage] = useState(1);
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();
  const assets = useAssetsSWR(chain, { suspense: true });

  const { closeTransport, createTransport } = useLedgerTransport();

  const { setLoadingLedgerSigning } = useLoading();

  const { t } = useTranslation();

  const feeCoins: FeeCoin[] = useMemo(
    () => [
      {
        originBaseDenom: chain.baseDenom,
        baseDenom: chain.baseDenom,
        displayDenom: chain.displayDenom,
        decimals: chain.decimals,
        coinGeckoId: chain.coinGeckoId,
      },
      ...assets.data.map((asset) => ({
        originBaseDenom: asset.base_denom,
        baseDenom: asset.denom,
        decimals: asset.decimal,
        displayDenom: asset.dp_denom,
        coinGeckoId: asset.coinGeckoId,
      })),
    ],
    [assets.data, chain.baseDenom, chain.coinGeckoId, chain.decimals, chain.displayDenom],
  );

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, isEditFee, isEditMemo, gasRate },
  } = message;

  const { fee, msgs } = doc;

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const inputGas = fee.gas;

  const inputFee = fee.amount.find((item) => feeCoins.map((feeCoin) => feeCoin.baseDenom).includes(item.denom)) ||
    fee.amount[0] || {
      denom: chain.baseDenom,
      amount: '0',
    };
  const inputFeeAmount = inputFee.amount;

  const selectedFeeCoin: FeeCoin = feeCoins.find((feeCoin) => feeCoin.baseDenom === inputFee.denom) || {
    decimals: 0,
    baseDenom: inputFee.denom,
    originBaseDenom: inputFee.denom,
    displayDenom: 'UNKNOWN',
  };

  const baseGasRate = gasRate || chain.gasRate;

  const tinyFee = times(inputGas, baseGasRate.tiny);
  const lowFee = times(inputGas, baseGasRate.low);
  const averageFee = times(inputGas, baseGasRate.average);

  const isExistZeroFee = tinyFee === '0' || lowFee === '0' || averageFee === '0';

  const initBaseFee = isEditFee && !isExistZeroFee && lt(inputFeeAmount, '1') ? lowFee : inputFeeAmount;

  const [gas, setGas] = useState(inputGas);
  const [baseFee, setBaseFee] = useState(initBaseFee);
  const [memo, setMemo] = useState(doc.memo);

  const signingMemo = isEditMemo ? memo : doc.memo;

  const fixedBaseFee = useMemo(() => fix(baseFee, 0, 0), [baseFee]);

  const signingFee = isEditFee ? { amount: [{ denom: selectedFeeCoin.baseDenom, amount: fixedBaseFee }], gas } : doc.fee;

  const tx = { ...doc, memo: signingMemo, fee: signingFee };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.Amino.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.Amino.entry.dataTab')} />
          </Tabs>
        </TabContainer>
        <TabPanel value={value} index={0}>
          <TxMessage msg={msgs[txMsgPage - 1]} chain={chain} />
          {msgs.length > 1 && (
            <PaginationContainer>
              <Pagination currentPage={txMsgPage} totalPage={msgs.length} onChange={(page) => setTxMsgPage(page)} />
            </PaginationContainer>
          )}
          <MemoContainer>
            <Memo memo={memo} onChange={(m) => setMemo(m)} isEdit={isEditMemo} />
          </MemoContainer>
          <FeeContainer>
            <Fee
              feeCoin={selectedFeeCoin}
              gasRate={gasRate || chain.gasRate}
              baseFee={baseFee}
              gas={gas}
              onChangeFee={(f) => setBaseFee(f)}
              onChangeGas={(g) => setGas(g)}
              isEdit={isEditFee}
            />
          </FeeContainer>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Tx tx={tx} />
        </TabPanel>
      </ContentsContainer>
      <BottomContainer>
        <BottomButtonContainer>
          <OutlineButton
            onClick={async () => {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.USER_REJECTED_REQUEST,
                    message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                  },
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Amino.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                if (!keyPair) {
                  throw new Error('key pair does not exist');
                }

                const signature = await (async () => {
                  if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                    if (!keyPair.privateKey) {
                      throw new Error('key does not exist');
                    }

                    return signAmino(tx, keyPair.privateKey, chain);
                  }

                  if (currentAccount.type === 'LEDGER') {
                    setLoadingLedgerSigning(true);
                    const transport = await createTransport();

                    const cosmosApp = new CosmosApp(transport);

                    await cosmosApp.init();

                    const path = new Uint8Array([44, 118, 0, 0, Number(currentAccount.bip44.addressIndex)]);

                    const { compressed_pk } = await cosmosApp.getPublicKey(path);

                    const ledgerAddress = getAddress(chain, compressed_pk);

                    if (!isEqualsIgnoringCase(address, ledgerAddress)) {
                      throw new Error('Account address and Ledger address are not the same.');
                    }

                    const result = await cosmosApp.sign(path, Buffer.from(JSON.stringify(sortKeys(tx, { deep: true }))));

                    if (!result.signature) {
                      throw new Error(result.error_message);
                    }

                    return secp256k1.signatureImport(result.signature);
                  }

                  throw new Error('Unknown type account');
                })();
                const base64Signature = Buffer.from(signature).toString('base64');

                const base64PublicKey = Buffer.from(keyPair.publicKey).toString('base64');

                const publicKeyType = getPublicKeyType(chain);

                const pubKey = { type: publicKeyType, value: base64PublicKey };

                if (channel) {
                  try {
                    const url = cosmosURL(chain).postBroadcast();
                    const pTx = protoTx(tx, base64Signature, pubKey);

                    const response = await broadcast(url, pTx);

                    const { code } = response.tx_response;

                    if (code === 0) {
                      enqueueSnackbar('success');
                    } else {
                      throw new Error(response.tx_response.raw_log as string);
                    }
                  } catch (e) {
                    enqueueSnackbar(
                      (e as { message?: string }).message ? (e as { message?: string }).message : t('pages.Popup.Cosmos.Sign.Amino.entry.failedTransfer'),
                      {
                        variant: 'error',
                        autoHideDuration: 3000,
                      },
                    );
                  } finally {
                    setTimeout(
                      () => {
                        void deQueue();
                      },
                      currentAccount.type === 'LEDGER' && channel ? 1000 : 0,
                    );
                  }
                } else {
                  const result: CosSignAminoResponse = {
                    signature: base64Signature,
                    pub_key: pubKey,
                    signed_doc: tx,
                  };

                  responseToWeb({
                    response: {
                      result,
                    },
                    message,
                    messageId,
                    origin,
                  });

                  await deQueue();
                }
              } catch (e) {
                enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                setLoadingLedgerSigning(false);
              } finally {
                await closeTransport();
              }
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Amino.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToPopup />
    </Container>
  );
}
