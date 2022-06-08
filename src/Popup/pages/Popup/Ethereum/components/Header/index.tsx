import stc from 'string-to-color';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { MAINNET } from '~/constants/chain/ethereum/network/mainnet';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';

import { AccountContainer, AccountIcon, AccountText, ChainNameContainer, Container, OriginContainer, StyledDivider } from './styled';

import Account from '~/images/icons/Account10.svg';

type HeaderProps = {
  network?: EthereumNetwork;
  origin?: string;
  className?: string;
};

export default function Header({ network, origin, className }: HeaderProps) {
  const chain = ETHEREUM;
  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const shortAddress = shorterAddress(address, 12) || '';

  const chainName = (() => {
    if (network?.id === MAINNET.id) {
      return `${chain.chainName} ${network.networkName}`;
    }

    if (network) {
      return network.networkName;
    }

    return chain.chainName;
  })();

  const accountColor = stc(currentAccount.id);
  return (
    <Container className={className}>
      <AccountContainer>
        <AccountIcon data-account-color={accountColor}>
          <Account />
        </AccountIcon>
        <AccountText>
          <Typography variant="h6">{`${currentAccount.name} (${shortAddress})`}</Typography>
        </AccountText>
      </AccountContainer>
      <StyledDivider />
      <ChainNameContainer>
        <Typography variant="h3">{chainName}</Typography>
      </ChainNameContainer>
      {origin && (
        <OriginContainer>
          <Typography variant="h6">{origin}</Typography>
        </OriginContainer>
      )}
    </Container>
  );
}
