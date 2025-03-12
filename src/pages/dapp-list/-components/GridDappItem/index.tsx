import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useChainList } from '@/hooks/useChainList';
import type { FormattedDappEcosystemInfo } from '@/types/registry/dapp';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  BodyContainer,
  BodyText,
  BodyTopContainer,
  ChainImageContainer,
  MultipleChainContainer,
  OneChainContainer,
  PinButton,
  PinnedIconContainer,
  StyledButton,
} from './styled';

import UnFavoriteIcon from '@/assets/images/icons/UnFavorite16.svg';

type GridDappItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  dappItemInfo: FormattedDappEcosystemInfo;
};

const MAX_DISPLAY_CHAIN_COUNT = 7;

export default function GridDappItem({ dappItemInfo, ...remainer }: GridDappItemProps) {
  const { pinnedDappIds } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const totalChainCount = dappItemInfo.chainIds?.length || 0;
  const restChainCount = totalChainCount - MAX_DISPLAY_CHAIN_COUNT;

  const slicedChains = dappItemInfo.chainIds?.splice(0, MAX_DISPLAY_CHAIN_COUNT)?.map((chainId) => {
    return flatChainList.find((chain) => isMatchingUniqueChainId(chain, chainId));
  });

  const isOneChainSupported = slicedChains?.length === 1;

  return (
    <StyledButton {...remainer}>
      <BodyContainer>
        <BodyTopContainer>
          <Base1300Text variant="h2_B">{dappItemInfo.name}</Base1300Text>
          <PinButton>
            {pinnedDappIds.includes(dappItemInfo.id) ? (
              <PinnedIconContainer>
                <UnFavoriteIcon />
              </PinnedIconContainer>
            ) : (
              <UnFavoriteIcon />
            )}
          </PinButton>
        </BodyTopContainer>
        <BodyText variant="b4_R">{dappItemInfo.description}</BodyText>

        {isOneChainSupported ? (
          <OneChainContainer>
            <ChainImageContainer src={slicedChains[0]?.image} />
            <Base1000Text variant="b4_M">{slicedChains[0]?.name}</Base1000Text>
          </OneChainContainer>
        ) : (
          <MultipleChainContainer>
            {slicedChains?.map((chain) => {
              return <ChainImageContainer key={chain?.id} src={chain?.image} />;
            })}
            {totalChainCount > MAX_DISPLAY_CHAIN_COUNT && (
              <Base1000Text
                sx={{
                  marginLeft: '0.2rem',
                }}
                variant="h7n_M"
              >{`+${restChainCount}`}</Base1000Text>
            )}
          </MultipleChainContainer>
        )}
      </BodyContainer>
    </StyledButton>
  );
}
