import { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import secp256k1 from 'secp256k1';
import sortKeys from 'sort-keys';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gte, lt, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, getPublicKeyType, signAmino } from '~/Popup/utils/cosmos';
import CosmosApp from '~/Popup/utils/ledger/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, GasRateKey } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignAmino, CosSignAminoResponse } from '~/types/message/cosmos';
import type { Path } from '~/types/route';

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

  const { closeTransport, createTransport } = useLedgerTransport();

  const { setLoadingLedgerSigning } = useLoading();

  const { t } = useTranslation();

  const [isProgress, setIsProgress] = useState(false);

  const { feeCoins } = useCurrentFeesSWR(chain, { suspense: true });

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, isEditFee, isEditMemo, isCheckBalance, gasRate },
  } = message;

  const { fee, msgs } = doc;

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);
  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const inputGas = useMemo(() => fee.gas, [fee.gas]);

  const inputFee = useMemo(
    () =>
      fee.amount?.find((item) => feeCoins.map((feeCoin) => feeCoin.baseDenom).includes(item.denom)) ||
      fee.amount?.[0] || {
        denom: chain.baseDenom,
        amount: '0',
      },
    [chain.baseDenom, fee.amount, feeCoins],
  );

  const inputFeeAmount = useMemo(() => inputFee.amount, [inputFee.amount]);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(
    feeCoins.find((item) => item.baseDenom === inputFee.denom)?.baseDenom ?? feeCoins[0].baseDenom,
  );

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) ?? feeCoins[0], [currentFeeBaseDenom, feeCoins]);

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate || gasRate || chain.gasRate, [chain.gasRate, currentFeeCoin.gasRate, gasRate]);

  const tinyFee = useMemo(() => times(inputGas, currentFeeGasRate.tiny), [currentFeeGasRate.tiny, inputGas]);
  const lowFee = useMemo(() => times(inputGas, currentFeeGasRate.low), [currentFeeGasRate.low, inputGas]);
  const averageFee = useMemo(() => times(inputGas, currentFeeGasRate.average), [currentFeeGasRate.average, inputGas]);

  const isExistZeroFee = useMemo(() => tinyFee === '0' || lowFee === '0' || averageFee === '0', [averageFee, lowFee, tinyFee]);

  const initBaseFee = useMemo(
    () => (isEditFee && !isExistZeroFee && lt(inputFeeAmount, '1') ? lowFee : inputFeeAmount),
    [inputFeeAmount, isEditFee, isExistZeroFee, lowFee],
  );

  const [gas, setGas] = useState(inputGas);
  const [currentGasRateKey, setCurrentGasRateKey] = useState<GasRateKey>('low');
  const [baseFee, setBaseFee] = useState(initBaseFee);
  const [memo, setMemo] = useState(doc.memo);

  const signingMemo = useMemo(() => (isEditMemo ? memo : doc.memo), [doc.memo, isEditMemo, memo]);

  const ceilBaseFee = useMemo(() => ceil(baseFee), [baseFee]);

  const signingFee = useMemo(
    () => (isEditFee ? { ...fee, amount: [{ denom: currentFeeBaseDenom, amount: ceilBaseFee }], gas } : fee),
    [ceilBaseFee, currentFeeBaseDenom, fee, gas, isEditFee],
  );

  const tx = useMemo(() => ({ ...doc, memo: signingMemo, fee: signingFee }), [doc, signingFee, signingMemo]);

  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  const errorMessage = useMemo(() => {
    if (!gte(currentFeeCoin.availableAmount, baseFee) && isCheckBalance && !fee.granter && !fee.payer) {
      return t('pages.Popup.Cosmos.Sign.Amino.entry.insufficientFeeAmount');
    }

    return '';
  }, [baseFee, currentFeeCoin.availableAmount, fee.granter, fee.payer, isCheckBalance, t]);

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
          {msgs?.length > 0 && (
            <>
              <TxMessage msg={msgs[txMsgPage - 1]} chain={chain} isMultipleMsgs={msgs.length > 1} />
              {msgs.length > 1 && (
                <PaginationContainer>
                  <Pagination currentPage={txMsgPage} totalPage={msgs.length} onChange={(page) => setTxMsgPage(page)} />
                </PaginationContainer>
              )}
            </>
          )}
          <MemoContainer>
            <Memo memo={memo} onChange={(m) => setMemo(m)} isEdit={isEditMemo} />
          </MemoContainer>
          <FeeContainer>
            <Fee
              feeCoin={currentFeeCoin}
              feeCoinList={feeCoins}
              gasRate={currentFeeGasRate}
              baseFee={baseFee}
              gas={gas}
              onChangeFeeCoin={(selectedFeeCoin) => {
                setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
                setBaseFee(times(gas, feeCoins.find((item) => item.baseDenom === selectedFeeCoin.baseDenom)!.gasRate![currentGasRateKey]));
              }}
              onChangeFee={(f) => setBaseFee(f)}
              onChangeGas={(g) => setGas(g)}
              onChangeGasRateKey={(gasRateKey) => {
                setCurrentGasRateKey(gasRateKey);
                setBaseFee(times(gas, currentFeeGasRate[gasRateKey]));
              }}
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
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                disabled={!!errorMessage}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

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

                        const coinType = chain.bip44.coinType.replaceAll("'", '');

                        const path = [44, Number(coinType), 0, 0, Number(currentAccount.bip44.addressIndex)];

                        const { compressed_pk } = await cosmosApp.getPublicKey(path);

                        const ledgerAddress = getAddress(chain, Buffer.from(compressed_pk));

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
                    let testTxResponse: string;
                    if (channel) {
                      try {
                        const url = cosmosURL(chain).postBroadcast();
                        const pTx = protoTx(tx, base64Signature, pubKey);
                        const pTxBytes = pTx ? protoTxBytes({ ...pTx }) : undefined;

                        const response = await broadcast(url, pTxBytes);

                        const { code, txhash } = response.tx_response;

                        if (code === 0) {
                          testTxResponse = txhash;
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
                            if (testTxResponse) {
                              void deQueue(`/popup/tx-receipt/${testTxResponse}` as unknown as Path);
                            } else {
                              void deQueue();
                            }
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
                  } finally {
                    setLoadingLedgerSigning(false);
                    setIsProgress(false);
                    await closeTransport();
                  }
                }}
              >
                {t('pages.Popup.Cosmos.Sign.Amino.entry.signButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
