import { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import type { MessageTypeProperty, MessageTypes } from '@metamask/eth-sig-util';

import { COSMOS_DEFAULT_GAS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, equal, gte, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { getEIP712Signature } from '~/Popup/utils/ethermint';
import { responseToWeb } from '~/Popup/utils/message';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import type { CosmosChain, GasRateKey } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignEIP712, CosSignEIP712Response } from '~/types/message/cosmos';
import type { CustomTypedMessage } from '~/types/message/ethereum';

import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, FeeContainer, MemoContainer, PaginationContainer, TabContainer } from './styled';
import TxMessage from '../Amino/components/TxMessage';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';

type EntryProps = {
  queue: Queue<CosSignEIP712>;
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

  const { feeCoins, defaultGasRateKey } = useCurrentFeesSWR(chain, { suspense: true });

  const { message, messageId, origin } = queue;

  const {
    params: { doc, eip712, isEditFee = true, isEditMemo = true, isCheckBalance = true, gasRate },
  } = message;

  const { fee, msgs } = doc;
  const { types, domain, primaryType } = eip712;

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [customGasRateKey, setCustomGasRateKey] = useState<GasRateKey | undefined>();
  const currentGasRateKey = useMemo(() => customGasRateKey || (isEditFee ? defaultGasRateKey : undefined), [customGasRateKey, defaultGasRateKey, isEditFee]);

  const [memo, setMemo] = useState(doc.memo);

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

  const memoizedProtoTx = useMemo(() => {
    if (isEditFee) {
      const pTx = protoTx(
        { ...doc, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: '1' }], gas: COSMOS_DEFAULT_GAS } },
        Buffer.from(new Uint8Array(64)).toString('base64'),
        { type: getPublicKeyType(chain), value: '' },
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [chain, currentFeeCoin.baseDenom, doc, isEditFee]);

  const simulate = useSimulateSWR({ chain, txBytes: memoizedProtoTx?.tx_bytes });

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, getDefaultAV(chain), 0) : undefined),
    [chain, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(
    () => customGas || (gte(simulatedGas || '0', inputGas) ? simulatedGas || inputGas : inputGas),
    [customGas, inputGas, simulatedGas],
  );

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate || gasRate || chain.gasRate, [chain.gasRate, currentFeeCoin.gasRate, gasRate]);

  const signingMemo = useMemo(() => (isEditMemo ? memo : doc.memo), [doc.memo, isEditMemo, memo]);

  const isFeeCustomed = useMemo(() => !!customGas || !!customGasRateKey, [customGasRateKey, customGas]);

  const isFeeUpdateAllowed = useMemo(() => isEditFee || isFeeCustomed, [isFeeCustomed, isEditFee]);

  const initialGasRate = useMemo(() => (equal(inputGas, '0') ? '0' : divide(inputFeeAmount, inputGas)), [inputFeeAmount, inputGas]);

  const baseFee = useMemo(
    () => (isFeeUpdateAllowed ? times(currentGas, currentGasRateKey ? currentFeeGasRate[currentGasRateKey] : initialGasRate) : inputFeeAmount),
    [currentFeeGasRate, currentGas, currentGasRateKey, initialGasRate, inputFeeAmount, isFeeUpdateAllowed],
  );

  const ceilBaseFee = useMemo(() => ceil(baseFee), [baseFee]);

  const signingFee = useMemo(
    () => (isFeeUpdateAllowed ? { ...fee, amount: [{ denom: currentFeeBaseDenom, amount: ceilBaseFee }], gas: currentGas } : fee),
    [ceilBaseFee, currentFeeBaseDenom, currentGas, fee, isFeeUpdateAllowed],
  );

  const tx = useMemo(() => ({ ...doc, memo: signingMemo, fee: signingFee }), [doc, signingFee, signingMemo]);

  const typedMessageObject = useMemo(
    () =>
      ({
        types: types as Record<string, MessageTypeProperty[]>,
        domain,
        primaryType,
        message: tx,
      } as unknown as CustomTypedMessage<MessageTypes>),
    [domain, primaryType, tx, types],
  );

  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  const errorMessage = useMemo(() => {
    if (!gte(currentFeeCoin.availableAmount, baseFee) && isCheckBalance && !fee.granter && !fee.payer) {
      return t('pages.Popup.Cosmos.Sign.EIP712.entry.insufficientFeeAmount');
    }

    return '';
  }, [baseFee, currentFeeCoin.availableAmount, fee.granter, fee.payer, isCheckBalance, t]);

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.EIP712.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.EIP712.entry.dataTab')} />
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
              gas={currentGas}
              onChangeFeeCoin={(selectedFeeCoin) => {
                setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
              }}
              onChangeGas={(g) => setCustomGas(g)}
              onChangeGasRateKey={(gasRateKey) => {
                setCustomGasRateKey(gasRateKey);
              }}
              isEdit
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
            {t('pages.Popup.Cosmos.Sign.EIP712.entry.cancelButton')}
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

                    const signedTypedData = await (async () => {
                      if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                        throw new Error('Not supported account type.');
                      }

                      if (currentAccount.type === 'LEDGER') {
                        setLoadingLedgerSigning(true);
                        const transport = await createTransport();

                        return getEIP712Signature(transport, chain, currentAccount, typedMessageObject);
                      }

                      throw new Error('Unknown type account');
                    })();

                    const base64Signature = Buffer.from(signedTypedData, 'hex').toString('base64');

                    const base64PublicKey = Buffer.from(keyPair.publicKey).toString('base64');

                    const publicKeyType = getPublicKeyType(chain);

                    const pubKey = { type: publicKeyType, value: base64PublicKey };

                    const result: CosSignEIP712Response = {
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
                  } catch (e) {
                    enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                  } finally {
                    setLoadingLedgerSigning(false);
                    setIsProgress(false);
                    await closeTransport();
                  }
                }}
              >
                {t('pages.Popup.Cosmos.Sign.EIP712.entry.signButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
