import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS, ETHEREUM_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrent } from '~/Popup/hooks/useCurrent';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import ChainItemButton from './ChainItemButton';
import {
  BetaChainContainer,
  BetaChainListContainer,
  BetaChainTitleContainer,
  BodyContainer,
  ChainListContainer,
  Container,
  EthereumChainListContainer,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  StyledIconButton,
  TendermintChainListContainer,
} from './styled';

import SettingIcon from '~/images/icons/Setting.svg';

type ChainPopoverProps = Omit<PopoverProps, 'children'>;

export default function ChainPopover({ onClose, ...remainder }: ChainPopoverProps) {
  const { navigate } = useNavigate();
  const { currentAccount, currentChain, setCurrentChain } = useCurrent();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { allowedChains } = currentAccount;

  const allowedCosmosChain = COSMOS_CHAINS.filter((chain) => allowedChains.includes(chain.id));
  const allowedEthereumChain = ETHEREUM_CHAINS.filter((chain) => allowedChains.includes(chain.id));

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a chain</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/chain/management')}>
              <SettingIcon />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          {allowedCosmosChain.length > 0 && (
            <TendermintChainListContainer>
              <ChainListContainer>
                {allowedCosmosChain.map((chain) => (
                  <ChainItemButton
                    key={chain.id}
                    isActive={currentChain.id === chain.id}
                    imgSrc={chain.imageURL}
                    onClick={async () => {
                      await setCurrentChain(chain);
                      onClose?.({}, 'backdropClick');
                    }}
                  >
                    {chain.chainName}
                  </ChainItemButton>
                ))}
              </ChainListContainer>
            </TendermintChainListContainer>
          )}
          {allowedCosmosChain.length > 0 && allowedEthereumChain.length > 0 && <Divider />}
          {allowedEthereumChain.length > 0 && (
            <EthereumChainListContainer>
              <ChainListContainer>
                {allowedEthereumChain.map((chain) => (
                  <ChainItemButton
                    key={chain.id}
                    isActive={currentChain.id === chain.id}
                    imgSrc={chain.imageURL}
                    onClick={async () => {
                      await setCurrentChain(chain);
                      onClose?.({}, 'backdropClick');
                    }}
                  >
                    {chain.chainName}
                  </ChainItemButton>
                ))}
              </ChainListContainer>
            </EthereumChainListContainer>
          )}
          <BetaChainContainer>
            <BetaChainTitleContainer>
              <Typography variant="h6">Beta support</Typography>
            </BetaChainTitleContainer>
            <BetaChainListContainer>
              <ChainListContainer>
                <ChainItemButton onClick={() => console.log('select chain')} onClickDelete={() => console.log('delete')}>
                  Axeler
                </ChainItemButton>
                <ChainItemButton onClickDelete={() => console.log('delete')}>adadad</ChainItemButton>
              </ChainListContainer>
            </BetaChainListContainer>
          </BetaChainContainer>
        </BodyContainer>
      </Container>
    </Popover>
  );
}
