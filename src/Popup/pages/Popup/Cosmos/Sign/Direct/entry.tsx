import { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useGasMultiplySWR } from '~/Popup/hooks/SWR/cosmos/useGasMultiplySWR';
import { useProtoBuilderDecodeSWR } from '~/Popup/hooks/SWR/cosmos/useProtoBuilderDecodeSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, equal, gt, gte, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, getPublicKeyType, signDirect } from '~/Popup/utils/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, decodeProtobufMessage, protoTxBytes } from '~/Popup/utils/proto';
import { cosmos } from '~/proto/cosmos-sdk-v0.47.4.js';
import type { CosmosChain, FeeCoin, GasRateKey } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignDirect, CosSignDirectResponse } from '~/types/message/cosmos';
import type { Path } from '~/types/route';

import TxMessage from './components/TxMessage';
import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, FeeContainer, MemoContainer, PaginationContainer, TabContainer } from './styled';
import DecodedTx from '../components/DecodedTx';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';

type EntryProps = {
  queue: Queue<CosSignDirect>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const [value, setValue] = useState(0);
  const [txMsgPage, setTxMsgPage] = useState(1);
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const [isProgress, setIsProgress] = useState(false);

  const { data: gasMultiply } = useGasMultiplySWR(chain);

  const assets = useAssetsSWR(chain);

  const balance = useBalanceSWR(chain);

  const { feeCoins: supportedFeeCoins, defaultGasRateKey } = useCurrentFeesSWR(chain, { suspense: true });

  const availableFeeCoins = useMemo(() => {
    const availableCoins: FeeCoin[] = assets.data.map((asset) => ({
      originBaseDenom: asset.origin_denom,
      baseDenom: asset.denom,
      decimals: asset.decimals,
      displayDenom: asset.symbol,
      coinGeckoId: asset.coinGeckoId,
      availableAmount: balance.data?.balance?.find((item) => item.denom === asset.denom)?.amount || '0',
      gasRate: undefined,
    }));

    const aggregatedFeeCoins = [...supportedFeeCoins, ...availableCoins];

    const uniqueFeeCoins = aggregatedFeeCoins.reduce((acc: FeeCoin[], current) => {
      if (!acc.find((coin) => coin.baseDenom === current.baseDenom)) {
        return [...acc, current];
      }
      return acc;
    }, []);
    return uniqueFeeCoins;
  }, [assets.data, balance.data?.balance, supportedFeeCoins]);

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, isEditFee = true, isEditMemo = true, isCheckBalance = true, gasRate },
  } = message;

  const auth_info_bytes = useMemo(() => new Uint8Array(doc.auth_info_bytes), [doc.auth_info_bytes]);
  const body_bytes = useMemo(() => new Uint8Array(doc.body_bytes), [doc.body_bytes]);

  const decodedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.decode(body_bytes), [body_bytes]);
  const decodedAuthInfoBytes = useMemo(() => cosmos.tx.v1beta1.AuthInfo.decode(auth_info_bytes), [auth_info_bytes]);

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [customGasRateKey, setCustomGasRateKey] = useState<GasRateKey | undefined>();
  const currentGasRateKey = useMemo(() => customGasRateKey || (isEditFee ? defaultGasRateKey : undefined), [customGasRateKey, defaultGasRateKey, isEditFee]);

  const [memo, setMemo] = useState(decodedBodyBytes.memo || '');

  const { fee, signer_infos } = decodedAuthInfoBytes;

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);
  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const inputGas = useMemo(() => (fee?.gas_limit ? String(fee.gas_limit) : '0'), [fee?.gas_limit]);

  const inputFee = useMemo(() => {
    const foundFee = fee?.amount?.find(
      (item) => item?.denom && item?.amount && availableFeeCoins.map((feeCoin) => feeCoin.baseDenom).includes(item?.denom || ''),
    );

    if (foundFee) return foundFee;

    if (fee?.amount?.[0]?.amount && fee?.amount?.[0].denom) {
      return fee.amount[0];
    }

    return {
      denom: chain.baseDenom,
      amount: '0',
    };
  }, [chain.baseDenom, fee?.amount, availableFeeCoins]);

  const inputFeeAmount = useMemo(() => inputFee.amount || '0', [inputFee.amount]);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(inputFee.denom);

  const currentFeeCoin = useMemo(
    () =>
      availableFeeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) || {
        availableAmount: balance.data?.balance?.find((item) => item.denom === inputFee.denom)?.amount || '0',
        decimals: 0,
        baseDenom: inputFee.denom || '',
        originBaseDenom: inputFee.denom || '',
        displayDenom: 'UNKNOWN',
        gasRate: undefined,
      },
    [availableFeeCoins, balance.data?.balance, currentFeeBaseDenom, inputFee.denom],
  );

  const memoizedProtoTx = useMemo(() => {
    if (isEditFee) {
      const signatures = signer_infos.map(() => Buffer.from(new Uint8Array(64)).toString('base64'));

      return protoTxBytes({
        signatures,
        txBodyBytes: body_bytes,
        authInfoBytes: auth_info_bytes,
      });
    }
    return null;
  }, [auth_info_bytes, body_bytes, isEditFee, signer_infos]);

  const simulate = useSimulateSWR({ chain, txBytes: memoizedProtoTx?.tx_bytes });

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasMultiply, 0) : undefined),
    [gasMultiply, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(
    () => customGas || (gte(simulatedGas || '0', inputGas) ? simulatedGas || inputGas : inputGas),
    [customGas, inputGas, simulatedGas],
  );

  const initialGasRate = useMemo(() => (equal(inputGas, '0') ? '0' : divide(inputFeeAmount, inputGas)), [inputFeeAmount, inputGas]);

  const currentFeeGasRate = useMemo(() => {
    if (currentFeeCoin.gasRate) {
      return currentFeeCoin.gasRate;
    }

    if (gasRate) {
      return gasRate;
    }

    if (gt(initialGasRate, '0')) {
      return {
        average: initialGasRate,
        low: initialGasRate,
        tiny: initialGasRate,
      };
    }

    return chain.gasRate;
  }, [chain.gasRate, currentFeeCoin.gasRate, gasRate, initialGasRate]);

  const isFeeCustomed = useMemo(() => !!customGas || !!customGasRateKey, [customGasRateKey, customGas]);

  const isFeeUpdateAllowed = useMemo(() => isEditFee || isFeeCustomed, [isFeeCustomed, isEditFee]);

  const baseFee = useMemo(
    () => (isFeeUpdateAllowed ? times(currentGas, currentGasRateKey ? currentFeeGasRate[currentGasRateKey] : initialGasRate) : inputFeeAmount),
    [currentFeeGasRate, currentGas, currentGasRateKey, initialGasRate, inputFeeAmount, isFeeUpdateAllowed],
  );

  const ceilBaseFee = useMemo(() => ceil(baseFee), [baseFee]);

  const encodedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.encode({ ...decodedBodyBytes, memo }).finish(), [decodedBodyBytes, memo]);
  const encodedAuthInfoBytes = useMemo(
    () =>
      cosmos.tx.v1beta1.AuthInfo.encode({
        ...decodedAuthInfoBytes,
        fee: { ...fee, amount: [{ denom: currentFeeBaseDenom, amount: ceilBaseFee }], gas_limit: Number(currentGas) },
      }).finish(),
    [ceilBaseFee, currentFeeBaseDenom, decodedAuthInfoBytes, fee, currentGas],
  );

  const bodyBytes = useMemo(() => (isEditMemo ? encodedBodyBytes : body_bytes), [body_bytes, encodedBodyBytes, isEditMemo]);
  const authInfoBytes = useMemo(
    () => (isFeeUpdateAllowed ? encodedAuthInfoBytes : auth_info_bytes),
    [auth_info_bytes, encodedAuthInfoBytes, isFeeUpdateAllowed],
  );

  const decodedChangedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.decode(bodyBytes), [bodyBytes]);
  const decodedChangedAuthInfoBytes = useMemo(() => cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes), [authInfoBytes]);

  const decodedTxData = useProtoBuilderDecodeSWR({
    authInfoBytes: Buffer.from(authInfoBytes).toString('hex'),
    txBodyBytes: Buffer.from(bodyBytes).toString('hex'),
  });

  const { messages } = decodedChangedBodyBytes;
  const msgs = useMemo(() => messages.map((item) => decodeProtobufMessage(item)), [messages]);

  const tx = useMemo(
    () => ({
      ...doc,
      body_bytes: { ...decodedChangedBodyBytes, messages: msgs },
      auth_info_bytes: decodedChangedAuthInfoBytes,
    }),
    [decodedChangedAuthInfoBytes, decodedChangedBodyBytes, doc, msgs],
  );

  const decodedByProtoBuilderTx = useMemo(
    () =>
      decodedTxData.data && {
        ...doc,
        body_bytes: decodedTxData.data?.body,
        auth_info_bytes: decodedTxData.data?.auth_info,
      },
    [decodedTxData.data, doc],
  );

  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  const errorMessage = useMemo(() => {
    if (!gte(currentFeeCoin.availableAmount, baseFee) && isCheckBalance && !fee?.granter && !fee?.payer) {
      return t('pages.Popup.Cosmos.Sign.Direct.entry.insufficientFeeAmount');
    }

    if (currentAccount.type === 'LEDGER') {
      return t('pages.Popup.Cosmos.Sign.Direct.entry.invalidAccountType');
    }

    return '';
  }, [baseFee, currentAccount.type, currentFeeCoin.availableAmount, fee?.granter, fee?.payer, isCheckBalance, t]);

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.dataTab')} />
            {decodedByProtoBuilderTx && <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.decodedDataTab')} />}
          </Tabs>
        </TabContainer>
        <TabPanel value={value} index={0}>
          <TxMessage msg={msgs[txMsgPage - 1]} chain={chain} isMultipleMsgs={msgs.length > 1} />
          {msgs.length > 1 && (
            <PaginationContainer>
              <Pagination currentPage={txMsgPage} totalPage={msgs.length} onChange={(page) => setTxMsgPage(page)} />
            </PaginationContainer>
          )}
          <MemoContainer>
            <Memo memo={memo} onChange={(m) => setMemo(m)} isEdit={isEditMemo} />
          </MemoContainer>

          {fee && (
            <FeeContainer>
              <Fee
                feeCoin={currentFeeCoin}
                feeCoinList={supportedFeeCoins}
                gasRate={currentFeeGasRate}
                baseFee={baseFee}
                gas={currentGas}
                onChangeFeeCoin={(selectedFeeCoin) => {
                  setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
                  setCustomGasRateKey('low');
                }}
                onChangeGas={(g) => setCustomGas(g)}
                onChangeGasRateKey={(gasRateKey) => {
                  setCustomGasRateKey(gasRateKey);
                }}
                isEdit
              />
            </FeeContainer>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Tx tx={tx} />
        </TabPanel>
        {decodedByProtoBuilderTx && (
          <TabPanel value={value} index={2}>
            <DecodedTx tx={decodedByProtoBuilderTx} />
          </TabPanel>
        )}
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
            {t('pages.Popup.Cosmos.Sign.Direct.entry.cancelButton')}
          </OutlineButton>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                disabled={!!errorMessage}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

                    if (!keyPair?.privateKey) {
                      throw new Error('Unknown Error');
                    }
                    const signedDoc = { ...doc, body_bytes: bodyBytes, auth_info_bytes: authInfoBytes };

                    const signature = signDirect(signedDoc, keyPair.privateKey, chain);

                    const base64Signature = Buffer.from(signature).toString('base64');

                    if (channel) {
                      try {
                        const url = cosmosURL(chain).postBroadcast();
                        const pTxBytes = protoTxBytes({
                          signatures: [base64Signature],
                          txBodyBytes: signedDoc.body_bytes,
                          authInfoBytes: signedDoc.auth_info_bytes,
                        });

                        const response = await broadcast(url, pTxBytes);

                        const { code, txhash } = response.tx_response;

                        if (code === 0) {
                          if (txhash) {
                            void deQueue(`/popup/tx-receipt/${txhash}/${chain.id}` as unknown as Path);
                          } else {
                            void deQueue();
                          }
                        } else {
                          throw new Error(response.tx_response.raw_log as string);
                        }
                      } catch (e) {
                        enqueueSnackbar(
                          (e as { message?: string }).message ? (e as { message?: string }).message : t('pages.Popup.Cosmos.Sign.Direct.entry.failedTransfer'),
                          {
                            variant: 'error',
                            autoHideDuration: 3000,
                          },
                        );

                        void deQueue();
                      }
                    } else {
                      const base64PublicKey = Buffer.from(keyPair.publicKey).toString('base64');

                      const publicKeyType = getPublicKeyType(chain);

                      const pubKey = { type: publicKeyType, value: base64PublicKey };

                      const signedDocArray = {
                        ...doc,
                        body_bytes: [...Array.from(bodyBytes)],
                        auth_info_bytes: [...Array.from(authInfoBytes)],
                      };

                      const result: CosSignDirectResponse = {
                        signature: base64Signature,
                        pub_key: pubKey,
                        signed_doc: signedDocArray,
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
                    setIsProgress(false);
                  }
                }}
              >
                {t('pages.Popup.Cosmos.Sign.Direct.entry.confirmButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
