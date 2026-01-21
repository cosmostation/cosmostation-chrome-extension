import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import EventDialog from '@/components/EventDialog';
import FloatingButton from '@/components/FloatingButton';
import FloatingContents from '@/components/FloatingButton/components/FloatingContents';
import FooterCoinPrice from '@/components/FooterCoinPrice';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { BABYLON_POPOVER_ID, STAKE_ETH_POPOVER_ID } from '@/constants/adPopover';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as CoinAbout } from '@/pages/coin-detail/$coinId/about';
import type { ChainType } from '@/types/chain';
import { isStillBlocked } from '@/utils/date';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { FloatingButtonContainer, FooterContainer } from './-styled';

import BabylonFloatingImage from '@/assets/images/ad/babylonFloating.png';
import BabylonDialogImage from '@/assets/images/ad/babylonPopup.png';
import EthereumFloatingImage from '@/assets/images/ad/ethereumFloating.png';
import EthereumDialogImage from '@/assets/images/ad/ethereumPopup.png';

type LayoutProps = {
  children: JSX.Element;
  coinId: string;
};

export const FLOATING_CONTENTS_CONFIG = [
  {
    condition: (id: string, chainId: string, chainType: ChainType) =>
      (id === 'ubbn' && (chainId === 'babylon' || chainId === 'babylon-testnet')) || chainType === 'bitcoin',
    content: {
      popOverId: BABYLON_POPOVER_ID,
      image: BabylonFloatingImage,
      bgImage: BabylonDialogImage,
      launchButtonText: 'Stake Now',
      borderColor: {
        startColor: '#FF7C2B',
        endColor: '#56C4C8',
      },
      launchButtonStyle: {
        bgColor: '#FF872C',
        hoverColor: ' #E57A28',
      },
      launchFunc: () => window.open('https://btcstaking.babylonlabs.io/', '_blank'),
    },
  },
  {
    condition: (id: string, chainId: string) => isEqualsIgnoringCase(id, NATIVE_EVM_COIN_ADDRESS) && chainId === 'ethereum',
    content: {
      popOverId: STAKE_ETH_POPOVER_ID,
      image: EthereumFloatingImage,
      bgImage: EthereumDialogImage,
      launchButtonText: 'Stake Now',
      borderColor: {
        startColor: '#FFCDBE',
        endColor: '#97EEFF',
      },
      launchButtonStyle: {
        bgColor: '#5A43FF',
        hoverColor: ' #523DE5',
      },
      launchFunc: () => window.open('https://app.eigenlayer.xyz/operator/0x3303fda11d6bafe0833d6a6c44c2b8edbab92e4d', '_blank'),
    },
  },
];

export function getFloatingContentConfig(coinId: string) {
  const { id, chainId, chainType } = parseCoinId(coinId);

  const config = FLOATING_CONTENTS_CONFIG.find((config) => config.condition(id, chainId, chainType));

  return config?.content;
}

export default function Layout({ children, coinId }: LayoutProps) {
  const navigate = useNavigate();
  const { currentAccount } = useCurrentAccount();
  const adPopoverState = useExtensionStorageStore((state) => state.adPopoverState);
  const [isOpenEventDialog, setIsOpenEventDialog] = useState(false);

  const floatingContents = getFloatingContentConfig(coinId);

  return (
    <>
      <BaseLayout
        header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{currentAccount.name}</Base1300Text>} />}
        footer={
          <FooterContainer>
            <FloatingButtonContainer>
              {floatingContents && (
                <FloatingButton
                  onClick={async () => {
                    const { lastClosed } = adPopoverState[floatingContents.popOverId] || {};
                    const isBlocked = lastClosed ? isStillBlocked(lastClosed, 7) : false;

                    if (isBlocked) {
                      floatingContents.launchFunc();
                    } else {
                      setIsOpenEventDialog(true);
                    }
                  }}
                >
                  <FloatingContents image={floatingContents.image} borderColor={floatingContents.borderColor} />
                </FloatingButton>
              )}
            </FloatingButtonContainer>
            <FooterCoinPrice
              coinId={coinId}
              onClick={() => {
                navigate({
                  to: CoinAbout.to,
                  params: {
                    coinId: coinId,
                  },
                });
              }}
            />
          </FooterContainer>
        }
      >
        {children}
      </BaseLayout>
      {floatingContents && (
        <EventDialog
          open={isOpenEventDialog}
          onClose={() => {
            setIsOpenEventDialog(false);
          }}
          popOverId={floatingContents.popOverId}
          image={floatingContents.bgImage}
          launchFunc={floatingContents.launchFunc}
          launchButtonText={floatingContents.launchButtonText}
          launchButtonStyle={floatingContents.launchButtonStyle}
        />
      )}
    </>
  );
}
