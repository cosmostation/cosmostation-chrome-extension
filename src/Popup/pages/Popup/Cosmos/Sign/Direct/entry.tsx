import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { COSMOS_DEFAULT_GAS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gte, lt, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, getPublicKeyType, signDirect } from '~/Popup/utils/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, decodeProtobufMessage, protoTxBytes } from '~/Popup/utils/proto';
import { cosmos } from '~/proto/cosmos-v0.44.2.js';
import type { CosmosChain, GasRateKey } from '~/types/chain';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignDirect, CosSignDirectResponse } from '~/types/message/cosmos';

import TxMessage from './components/TxMessage';
import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, FeeContainer, MemoContainer, PaginationContainer, TabContainer } from './styled';
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

  const { feeCoins } = useCurrentFeesSWR(chain, { suspense: true });

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, isEditFee, isEditMemo, gasRate },
  } = message;

  const { auth_info_bytes, body_bytes } = doc;

  const decodedBodyBytes = cosmos.tx.v1beta1.TxBody.decode(body_bytes);
  const decodedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.decode(auth_info_bytes);

  const { fee } = decodedAuthInfoBytes;

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const inputGas = fee?.gas_limit ? String(fee.gas_limit) : COSMOS_DEFAULT_GAS;

  const inputFee = useMemo(() => {
    const foundFee = fee?.amount?.find((item) => item?.denom && item?.amount && feeCoins.map((feeCoin) => feeCoin.baseDenom).includes(item?.denom || ''));

    if (foundFee) return foundFee;

    if (fee?.amount?.[0].amount && fee?.amount?.[0].denom) {
      return fee.amount[0];
    }

    return {
      denom: chain.baseDenom,
      amount: '0',
    };
  }, [chain.baseDenom, fee?.amount, feeCoins]);

  const inputFeeAmount = inputFee.amount || '0';

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(
    feeCoins.find((item) => item.baseDenom === inputFee.denom)?.baseDenom ?? feeCoins[0].baseDenom,
  );

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) ?? feeCoins[0], [currentFeeBaseDenom, feeCoins]);

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate || gasRate || chain.gasRate, [chain.gasRate, currentFeeCoin.gasRate, gasRate]);

  const tinyFee = times(inputGas, currentFeeGasRate.tiny);
  const lowFee = times(inputGas, currentFeeGasRate.low);
  const averageFee = times(inputGas, currentFeeGasRate.average);

  const isExistZeroFee = tinyFee === '0' || lowFee === '0' || averageFee === '0';

  const initBaseFee = isEditFee && !isExistZeroFee && lt(inputFeeAmount, '1') ? lowFee : inputFeeAmount;

  const [gas, setGas] = useState(inputGas);
  const [currentGasRateKey, setCurrentGasRateKey] = useState<GasRateKey>('low');
  const [baseFee, setBaseFee] = useState(initBaseFee);
  const [memo, setMemo] = useState(decodedBodyBytes.memo || '');

  const ceilBaseFee = useMemo(() => ceil(baseFee), [baseFee]);

  const encodedBodyBytes = cosmos.tx.v1beta1.TxBody.encode({ ...decodedBodyBytes, memo }).finish();
  const encodedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.encode({
    ...decodedAuthInfoBytes,
    fee: { ...fee, amount: [{ denom: currentFeeBaseDenom, amount: ceilBaseFee }], gas_limit: Number(gas) },
  }).finish();

  const bodyBytes = isEditMemo ? encodedBodyBytes : doc.body_bytes;
  const authInfoBytes = isEditFee ? encodedAuthInfoBytes : doc.auth_info_bytes;

  const decodedChangedBodyBytes = cosmos.tx.v1beta1.TxBody.decode(bodyBytes);
  const decodedChangedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes);

  const { messages } = decodedChangedBodyBytes;
  const msgs = messages.map((item) => decodeProtobufMessage(item));

  const tx = {
    ...doc,
    body_bytes: { ...decodedChangedBodyBytes, messages: msgs },
    auth_info_bytes: decodedChangedAuthInfoBytes,
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const errorMessage = useMemo(() => {
    if (!gte(currentFeeCoin.availableAmount, baseFee) && !fee?.granter && !fee?.payer) {
      return t('pages.Popup.Cosmos.Sign.Direct.entry.insufficientFeeAmount');
    }

    if (currentAccount.type === 'LEDGER') {
      return t('pages.Popup.Cosmos.Sign.Direct.entry.invalidAccountType');
    }

    return '';
  }, [baseFee, currentAccount.type, currentFeeCoin.availableAmount, fee?.granter, fee?.payer, t]);

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.dataTab')} />
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
          )}
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
            {t('pages.Popup.Cosmos.Sign.Direct.entry.cancelButton')}
          </OutlineButton>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                disabled={!!errorMessage}
                onClick={async () => {
                  try {
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
                          signature: base64Signature,
                          txBodyBytes: signedDoc.body_bytes,
                          authInfoBytes: signedDoc.auth_info_bytes,
                        });

                        const response = await broadcast(url, pTxBytes);

                        const { code } = response.tx_response;

                        if (code === 0) {
                          enqueueSnackbar('success');
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
                      } finally {
                        await deQueue();
                      }
                    } else {
                      const base64PublicKey = Buffer.from(keyPair.publicKey).toString('base64');

                      const publicKeyType = getPublicKeyType(chain);

                      const pubKey = { type: publicKeyType, value: base64PublicKey };

                      const signedDocHex = {
                        ...doc,
                        body_bytes: Buffer.from(bodyBytes).toString('hex'),
                        auth_info_bytes: Buffer.from(authInfoBytes).toString('hex'),
                      };

                      const result: CosSignDirectResponse = {
                        signature: base64Signature,
                        pub_key: pubKey,
                        signed_doc: signedDocHex as unknown as SignDirectDoc,
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
