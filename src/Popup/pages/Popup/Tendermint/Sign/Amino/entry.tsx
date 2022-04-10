import { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { PUBLIC_KEY_TYPE } from '~/constants/tendermint';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import Fee from '~/Popup/components/Fee';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { getKeyPair, upperCaseFirst } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, protoTx } from '~/Popup/utils/proto';
import { signAmino, tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { TenSignAmino, TenSignAminoResponse } from '~/types/tendermint/message';

import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  FeeContainer,
  MemoContainer,
  PaginationContainer,
  Tab,
  TabContainer,
  TabIndicatorContainer,
  TabPanelContainer,
  Tabs,
  TitleContainer,
} from './styled';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';

const a11yProps = (index: number) => ({
  id: `full-width-tab-${index}`,
  'aria-controls': `full-width-tabpanel-${index}`,
});

type EntryProps = {
  queue: Queue<TenSignAmino>;
  chain: TendermintChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const [txMsgPage, setTxMsgPage] = useState(1);
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { message, messageId, origin, channel } = queue;

  const {
    params: { doc, chainName, isEditFee, isEditMemo },
  } = message;

  const { fee, msgs } = doc;

  const inputGas = fee.gas;
  const inputFee = fee.amount.find((item) => item.denom === chain.baseDenom)?.amount || '0';

  const [gas, setGas] = useState(inputGas);
  const [baseFee, setBaseFee] = useState(inputFee);
  const [memo, setMemo] = useState(doc.memo);

  const signingMemo = isEditMemo ? memo : doc.memo;

  const signingFee = isEditFee ? { amount: [{ denom: chain.baseDenom, amount: baseFee }], gas } : doc.fee;

  const tx = { ...doc, memo: signingMemo, fee: signingFee };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <Container>
      <TitleContainer>
        <Typography variant="h3">{upperCaseFirst(chainName)}</Typography>
      </TitleContainer>
      <TabContainer>
        <Tabs value={value} onChange={handleChange} textColor="inherit" variant="fullWidth" indicatorColor="primary">
          <Tab label="Details" {...a11yProps(0)} />
          <Tab label="Data" {...a11yProps(1)} />
        </Tabs>
        <TabIndicatorContainer />
      </TabContainer>
      <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={value} onChangeIndex={handleChangeIndex}>
        <TabPanel value={value} index={0} dir={theme.direction}>
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
            <Fee chain={chain} baseFee={baseFee} gas={gas} onChangeFee={(f) => setBaseFee(f)} onChangeGas={(g) => setGas(g)} isEdit={isEditFee} />
          </FeeContainer>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Tx tx={tx} />
        </TabPanel>
      </SwipeableViews>
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
            Cancel
          </OutlineButton>
          <Button
            onClick={async () => {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);

              const signature = signAmino(tx, keyPair!.privateKey);
              const base64Signature = Buffer.from(signature).toString('base64');

              const base64PublicKey = Buffer.from(keyPair!.publicKey).toString('base64');

              const publicKeyType = PUBLIC_KEY_TYPE.SECP256K1;

              const pubKey = { type: publicKeyType, value: base64PublicKey };

              if (channel) {
                try {
                  const url = tendermintURL(chain).postBroadcast();
                  const pTx = protoTx(tx, base64Signature, pubKey);

                  const response = await broadcast(url, pTx);

                  const { code } = response.data.tx_response;

                  if (code === 0) {
                    enqueueSnackbar('success');
                  } else {
                    throw new Error(response.data.tx_response.raw_log);
                  }
                } catch (e) {
                  enqueueSnackbar((e as { message: string }).message, { variant: 'error', autoHideDuration: 3000 });
                } finally {
                  await deQueue();
                }
              } else {
                responseToWeb({
                  response: {
                    result: {
                      signature: base64Signature,
                      pub_key: pubKey,
                      signed_doc: tx,
                    } as TenSignAminoResponse,
                  },
                  message,
                  messageId,
                  origin,
                });

                await deQueue();
              }
            }}
          >
            Confirm
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}

type TabPanelProps = {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanelContainer role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} {...other}>
      {value === index && children}
    </TabPanelContainer>
  );
}
