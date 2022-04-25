import { useMemo } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ETHEREUM_CHAINS, TENDERMINT_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Chain } from '~/types/chain';

import ChainItemButton from './ChainItemButton';
import {
  BetaChainContainer,
  BetaChainListContainer,
  BetaChainTitleContainer,
  BodyContainer,
  ChainListContainer,
  Container,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  StyledDivider,
  StyledIconButton,
} from './styled';

import SettingIcon24 from '~/images/icons/Setting24.svg';

type ChainPopoverProps = Omit<PopoverProps, 'children'> & {
  currentChain: Chain;
  onClickChain?: (chain: Chain) => void;
  isVisibleAdditionalChains?: boolean;
};

export default function ChainPopover({ onClose, currentChain, onClickChain, isVisibleAdditionalChains = true, ...remainder }: ChainPopoverProps) {
  const { navigate } = useNavigate();
  const { setCurrentChain } = useCurrentChain();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { t } = useTranslation();

  const { allowedChainIds, additionalChains } = chromeStorage;

  const allowedTendermintChain = useMemo(() => TENDERMINT_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);
  const allowedEthereumChain = useMemo(() => ETHEREUM_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.ChainPopover.index.title')}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/chain/management')}>
              <SettingIcon24 />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          {allowedEthereumChain.length > 0 && (
            <ChainListContainer>
              {allowedEthereumChain.map((chain) => (
                <ChainItemButton
                  key={chain.id}
                  isActive={currentChain.id === chain.id}
                  imgSrc={chain.imageURL}
                  onClick={() => {
                    onClickChain?.(chain);
                    onClose?.({}, 'backdropClick');
                  }}
                >
                  {chain.chainName}
                </ChainItemButton>
              ))}
            </ChainListContainer>
          )}
          {allowedTendermintChain.length > 0 && allowedEthereumChain.length > 0 && <StyledDivider />}
          {allowedTendermintChain.length > 0 && (
            <ChainListContainer>
              {allowedTendermintChain.map((chain) => (
                <ChainItemButton
                  key={chain.id}
                  isActive={currentChain.id === chain.id}
                  imgSrc={chain.imageURL}
                  onClick={() => {
                    onClickChain?.(chain);
                    onClose?.({}, 'backdropClick');
                  }}
                >
                  {chain.chainName}
                </ChainItemButton>
              ))}
            </ChainListContainer>
          )}

          {isVisibleAdditionalChains && additionalChains.length > 0 && (
            <BetaChainContainer>
              <BetaChainTitleContainer>
                <Typography variant="h6">{t('pages.Wallet.components.Header.ChainPopover.index.betaSupport')}</Typography>
              </BetaChainTitleContainer>
              <BetaChainListContainer>
                <ChainListContainer>
                  {additionalChains.map((chain) => (
                    <ChainItemButton
                      key={chain.id}
                      onClick={() => {
                        onClickChain?.(chain);
                        onClose?.({}, 'backdropClick');
                      }}
                      onClickDelete={async () => {
                        if (currentChain.id === chain.id) {
                          await setCurrentChain([...allowedTendermintChain, ...allowedEthereumChain][0]);
                        }
                        const newAdditionalChains = additionalChains.filter((item) => item.id !== chain.id);

                        await setChromeStorage('additionalChains', newAdditionalChains);
                      }}
                      imgSrc={chain.imageURL}
                    >
                      {chain.chainName}
                    </ChainItemButton>
                  ))}
                </ChainListContainer>
              </BetaChainListContainer>
            </BetaChainContainer>
          )}
        </BodyContainer>
      </Container>
    </Popover>
  );
}
