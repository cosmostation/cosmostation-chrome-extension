import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { PUBLIC_KEY_TYPE } from '~/constants/cosmos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Fee from '~/Popup/components/Fee';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { fix, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, signAmino } from '~/Popup/utils/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, protoTx } from '~/Popup/utils/proto';
import type { CosmosChain } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { CosSignAmino, CosSignAminoResponse } from '~/types/cosmos/message';

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

  const { t } = useTranslation();

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, isEditFee, isEditMemo, gasRate },
  } = message;

  const { fee, msgs } = doc;

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const inputGas = fee.gas;
  const inputFee = fee.amount.find((item) => item.denom === chain.baseDenom)?.amount || '0';

  const baseGasRate = gasRate || chain.gasRate;

  const tinyFee = times(inputGas, baseGasRate.tiny);
  const lowFee = times(inputGas, baseGasRate.low);
  const averageFee = times(inputGas, baseGasRate.average);

  const isExistZeroFee = tinyFee === '0' || lowFee === '0' || averageFee === '0';

  const initBaseFee = isEditFee && !isExistZeroFee && inputFee === '0' ? lowFee : inputFee;

  const [gas, setGas] = useState(inputGas);
  const [baseFee, setBaseFee] = useState(initBaseFee);
  const [memo, setMemo] = useState(doc.memo);

  const signingMemo = isEditMemo ? memo : doc.memo;

  const fixedBaseFee = useMemo(() => fix(baseFee, 0, 0), [baseFee]);

  const signingFee = isEditFee ? { amount: [{ denom: chain.baseDenom, amount: fixedBaseFee }], gas } : doc.fee;

  const tx = { ...doc, memo: signingMemo, fee: signingFee };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <PopupHeader
        account={{ id: currentAccount.id, name: currentAccount.name, address }}
        chain={{ name: chain.chainName, imageURL: chain.imageURL }}
        origin={origin}
      />
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
              chain={chain}
              baseFee={baseFee}
              customGasRate={gasRate}
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
              const signature = signAmino(tx, keyPair!.privateKey, chain);
              const base64Signature = Buffer.from(signature).toString('base64');

              const base64PublicKey = Buffer.from(keyPair!.publicKey).toString('base64');

              const publicKeyType = (() => {
                if (chain.chainName === INJECTIVE.chainName) {
                  return PUBLIC_KEY_TYPE.INJ_SECP256K1;
                }

                if (chain.type === 'ETHERMINT') {
                  return PUBLIC_KEY_TYPE.ETH_SECP256K1;
                }

                return PUBLIC_KEY_TYPE.SECP256K1;
              })();

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
                    throw new Error(response.tx_response.raw_log);
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
                  await deQueue();
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
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Amino.entry.confirmButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
