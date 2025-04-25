import { useMemo, useState } from 'react';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useChainList } from '@/hooks/useChainList';
import type { DappEcosystemInfo } from '@/types/registry/dapp';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Badge,
  BodyContainer,
  BodyText,
  BodyTopContainer,
  ChainImageContainer,
  DappNameContainer,
  MultipleChainContainer,
  OneChainContainer,
  PinButton,
  PinnedIconContainer,
  StyledButton,
  ThumbnailImageContainer,
} from './styled';
import DappDetailBottomSheet from '../DappDetailBottomSheet';

import UnFavoriteIcon from '@/assets/images/icons/UnFavorite16.svg';

import dappDefaultImage from 'assets/images/default/dappDefault.png';

type GridDappItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  dappItemInfo: DappEcosystemInfo;
};

const MAX_DISPLAY_CHAIN_COUNT = 7;

export default function GridDappItem({ dappItemInfo, ...remainer }: GridDappItemProps) {
  const [isOpenDappDetailBottomSheet, setIsOpenDappDetailBottomSheet] = useState(false);

  const { pinnedDappIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const totalChainCount = dappItemInfo.chains?.length || 0;
  const restChainCount = totalChainCount - MAX_DISPLAY_CHAIN_COUNT;

  const slicedChains = useMemo(
    () =>
      dappItemInfo.chains?.slice(0, MAX_DISPLAY_CHAIN_COUNT)?.map((chainId) => {
        return flatChainList.find((chain) => chain.id === chainId);
      }),
    [dappItemInfo.chains, flatChainList],
  );

  const isOneChainSupported = slicedChains?.length === 1;

  const isPinned = useMemo(() => pinnedDappIds.includes(dappItemInfo.id), [dappItemInfo.id, pinnedDappIds]);

  const onPinButtonClick = () => {
    if (isPinned) {
      updateExtensionStorageStore(
        'pinnedDappIds',
        pinnedDappIds.filter((id) => id !== dappItemInfo.id),
      );
    } else {
      updateExtensionStorageStore('pinnedDappIds', [...pinnedDappIds, dappItemInfo.id]);
    }
  };

  return (
    <>
      <StyledButton
        onClick={() => {
          setIsOpenDappDetailBottomSheet(true);
        }}
        {...remainer}
      >
        <ThumbnailImageContainer src={dappItemInfo.thumbnail} defaultImgSrc={dappDefaultImage} />
        <BodyContainer>
          <BodyTopContainer>
            <DappNameContainer>
              <Base1300Text variant="b2_B">{dappItemInfo.name}</Base1300Text>
            </DappNameContainer>
            <PinButton
              onClick={(e) => {
                e.stopPropagation();
                onPinButtonClick();
              }}
            >
              {isPinned ? (
                <PinnedIconContainer>
                  <UnFavoriteIcon />
                </PinnedIconContainer>
              ) : (
                <UnFavoriteIcon />
              )}
            </PinButton>
          </BodyTopContainer>
          <BodyText variant="b4_R_Multiline">{dappItemInfo.description}</BodyText>

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
        <Badge>
          <Base1300Text variant="c2_B">{dappItemInfo.type}</Base1300Text>
        </Badge>
      </StyledButton>
      <DappDetailBottomSheet dappInfo={dappItemInfo} open={isOpenDappDetailBottomSheet} onClose={() => setIsOpenDappDetailBottomSheet(false)} />
    </>
  );
}
