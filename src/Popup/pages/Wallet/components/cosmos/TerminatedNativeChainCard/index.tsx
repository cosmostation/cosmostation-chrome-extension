import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import {
  ButtonContainer,
  Container,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  SecondLineContainer,
  SecondLineLeftAbsoluteImageContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledIconButton,
  TerminatedDescriptionContainer,
  ThirdLineContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import SendIcon from '~/images/icons/Send.svg';

type TerminatedNativeChainCardProps = {
  chain: CosmosChain;
  isCustom?: boolean;
};

export default function TerminatedNativeChainCard({ chain, isCustom = false }: TerminatedNativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { explorerURL } = chain;

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.copied'));
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
          <SecondLineLeftImage imageURL={chain.imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{chain.displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Typography variant="h6">{t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.inactiveNetwork')}</Typography>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <TerminatedDescriptionContainer>
          <Typography variant="h6">{t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.inactiveNetworkDescription')}</Typography>
          <Typography variant="h6">{t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.inactiveNetworkSubDescription')}</Typography>
        </TerminatedDescriptionContainer>
      </ThirdLineContainer>

      <ButtonContainer sx={{ paddingBottom: '1.6rem' }}>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.TerminatedNativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}

type DisplayDenomImageProps = {
  imageURL?: string;
  isCustom?: boolean;
};

function SecondLineLeftImage({ imageURL, isCustom = false }: DisplayDenomImageProps) {
  return (
    <SecondLineLeftImageContainer>
      <SecondLineLeftAbsoluteImageContainer>
        <Image src={imageURL} />
      </SecondLineLeftAbsoluteImageContainer>
      {isCustom && (
        <SecondLineLeftAbsoluteImageContainer>
          <Image src={customBeltImg} />
        </SecondLineLeftAbsoluteImageContainer>
      )}
    </SecondLineLeftImageContainer>
  );
}
