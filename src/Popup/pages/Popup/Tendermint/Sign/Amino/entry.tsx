import { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { CHAINS, TENDERMINT_CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { upperCaseFirst } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { TenSignAmino } from '~/types/tendermint/message';

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
import Fee from '../components/Fee';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';
import TxMessage from '../components/TxMessage';

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

  const { message, messageId, origin } = queue;

  const {
    params: { doc, chainName, isEditFee, isEditMemo },
  } = message;

  const { fee, msgs } = doc;

  const inputGas = fee.gas;
  const inputFee = fee.amount.find((item) => item.denom === chain.baseDenom)?.amount || '0';

  const [gas, setGas] = useState(inputGas);
  const [baseFee, setBaseFee] = useState(inputFee);
  const [memo, setMemo] = useState(doc.memo);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
            <Fee
              chain={TENDERMINT_CHAINS[0]}
              baseFee={baseFee}
              gas={gas}
              onChangeFee={(f) => setBaseFee(f)}
              onChangeGas={(g) => setGas(g)}
              isEdit={isEditFee}
            />
          </FeeContainer>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Tx tx={{ ...doc, memo, fee: { amount: [{ denom: chain.baseDenom, amount: baseFee }], gas } }} />
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
          <Button>Confirm</Button>
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
