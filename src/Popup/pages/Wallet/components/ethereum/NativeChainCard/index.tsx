import { Suspense } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import cosmosImg from '~/images/symbols/cosmos.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthereumChain } from '~/types/chain';

import {
  Container,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineCenterContainer,
  FourthLineContainer,
  SecondLineContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledIconButton,
  ThirdLineContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import SendIcon from '~/images/icons/Send.svg';

type NativeChainCardProps = {
  chain: EthereumChain;
};

export default function NativeChainCard({ chain }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const { currentNetwork } = useCurrentNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const accounts = useAccounts(true);
  const balance = useBalanceSWR(chain, true);

  const { navigate } = useNavigate();

  const { coinGeckoId, decimals, explorerURL } = currentNetwork;

  const { data } = useCoinGeckoPriceSWR();

  const amount = BigInt(balance?.data?.result || '0').toString();

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(price, displayAmount);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(`copied!`);
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{currentAddress}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${currentAddress}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImageContainer>
            <Image src={chain.imageURL} />
          </SecondLineLeftImageContainer>
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{currentNetwork.displayDenom.toUpperCase()}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Number fixed={6}>{displayAmount}</Number>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={2} currency={chromeStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={SendIcon} typoVarient="h5">
          Send
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          Receive
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain }: NativeChainCardProps) {
  const { currentNetwork } = useCurrentNetwork();
  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <Skeleton width="12rem" height="2.4rem" />
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          <StyledIconButton>
            <ExplorerIcon />
          </StyledIconButton>
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImageContainer>
            <Image src={chain.imageURL} />
          </SecondLineLeftImageContainer>
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{currentNetwork.displayDenom.toUpperCase()}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Skeleton width="12rem" height="2.6rem" />
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Skeleton width="8rem" height="1.9rem" />
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          Send
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          Receive
        </Button>
      </FourthLineContainer>
    </Container>
  );
}
