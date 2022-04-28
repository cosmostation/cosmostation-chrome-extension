import { useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/tendermint/useAmountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import type { TendermintChain } from '~/types/chain';

import {
  ButtonCenterContainer,
  ButtonContainer,
  Container,
  ExpandedButton,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineContainer,
  FourthLineContainerItem,
  FourthLineContainerItemLeft,
  FourthLineContainerItemRight,
  SecondLineContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
  StyledIconButton,
  ThirdLineContainer,
} from './styled';

import BottomArrow20Icon from '~/images/icons/BottomArrow20.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import SendIcon from '~/images/icons/Send.svg';

type NativeChainCardProps = {
  chain: TendermintChain;
};

const EXPANDED_KEY = 'wallet-tendermint-expanded';

export default function NativeChainCard({ chain }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const accounts = useAccounts(true);
  const { totalAmount, delegationAmount, rewardAmount, unbondingAmount, vestingNotDelegate, vestingRelatedAvailable } = useAmountSWR(chain, true);
  const { data } = useCoinGeckoPriceSWR();

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const { navigate } = useNavigate();

  const { decimals, coinGeckoId, explorerURL } = chain;

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const displayAmount = toDisplayDenomAmount(totalAmount, decimals);

  const value = times(displayAmount, price);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.tendermint.NativeChainCard.index.copied'));
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
            <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${currentAddress}`)}>
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
            <Typography variant="h3">{chain.displayDenom.toUpperCase()}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Number fixed={6}>{displayAmount}</Number>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={6}>
                  {toDisplayDenomAmount(vestingRelatedAvailable, decimals)}
                </Number>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.delegated')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={6}>
                  {toDisplayDenomAmount(delegationAmount, decimals)}
                </Number>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.unbonding')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={6}>
                  {toDisplayDenomAmount(unbondingAmount, decimals)}
                </Number>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.reward')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={6}>
                  {toDisplayDenomAmount(rewardAmount, decimals)}
                </Number>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.vesting')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={6}>
                  {toDisplayDenomAmount(vestingNotDelegate, decimals)}
                </Number>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.tendermint.NativeChainCard.index.depositButton')}
        </Button>
        <ButtonCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled={!gt(vestingRelatedAvailable, '0')} onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.tendermint.NativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>

      <ExpandedButton
        data-is-expanded={expanded ? 1 : 0}
        type="button"
        onClick={() => {
          setExpanded((prev) => {
            localStorage.setItem(EXPANDED_KEY, !prev ? '1' : '');
            return !prev;
          });
        }}
      >
        <BottomArrow20Icon />
      </ExpandedButton>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain }: NativeChainCardProps) {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const { explorerURL } = chain;

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const { enqueueSnackbar } = useSnackbar();

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(t('pages.Wallet.components.tendermint.NativeChainCard.index.copied'));
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${address}`)}>
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
            <Typography variant="h3">{chain.displayDenom.toUpperCase()}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Skeleton width="12rem" height="2.6rem" />
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Skeleton width="8rem" height="1.9rem" />
      </ThirdLineContainer>

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.delegated')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.unbonding')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.reward')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.tendermint.NativeChainCard.index.vesting')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.tendermint.NativeChainCard.index.depositButton')}
        </Button>
        <ButtonCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.tendermint.NativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>

      <ExpandedButton
        data-is-expanded={expanded ? 1 : 0}
        type="button"
        onClick={() => {
          setExpanded((prev) => {
            localStorage.setItem(EXPANDED_KEY, !prev ? '1' : '');
            return !prev;
          });
        }}
      >
        <BottomArrow20Icon />
      </ExpandedButton>
    </Container>
  );
}
