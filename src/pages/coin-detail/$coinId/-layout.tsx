import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import FloatingButton from '@/components/FloatingButton';
import FloatingContents from '@/components/FloatingButton/components/FloatingContents';
import FooterCoinPrice from '@/components/FooterCoinPrice';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { DROP_POPOVER_ID } from '@/constants/adPopover';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { isStillBlocked } from '@/utils/date';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator';
import { turnOnAdPopover } from '@/utils/zustand/adPopoverState';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { FloatingButtonContainer, FooterContainer } from './-styled';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

import DropFloatingImage from '@/assets/images/ad/dropFloating.png';

type LayoutProps = {
  children: JSX.Element;
  coinId: string;
};

export default function Layout({ children, coinId }: LayoutProps) {
  const { currentAccount } = useCurrentAccount();
  const { adPopoverState } = useExtensionStorageStore((state) => state);

  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const explorerUrl = currentCoin?.chain.explorer?.account.replace('${address}', currentCoin.address.address);

  const floatingContents = (() => {
    const { id, chainId } = parseCoinId(coinId);

    if (id === 'uatom' && chainId === 'cosmos') {
      return {
        popOverId: DROP_POPOVER_ID,
        image: DropFloatingImage,
        borderColor: {
          startColor: '#E7D5FC',
          endColor: '#302659',
        },
        launchFunc: () => {
          window.open('https://app.drop.money/stake', '_blank');
        },
      };
    }
  })();

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<Base1300Text variant="h4_B">{currentAccount.name}</Base1300Text>}
          rightContent={
            <IconButton onClick={() => window.open(explorerUrl, '_blank')}>
              <ExplorerIcon />
            </IconButton>
          }
        />
      }
      footer={
        <FooterContainer>
          <FloatingButtonContainer>
            {floatingContents && (
              <FloatingButton
                onClick={async () => {
                  const { lastClosed } = adPopoverState[floatingContents.popOverId];
                  const isBlocked = lastClosed ? isStillBlocked(lastClosed, 7) : false;

                  if (isBlocked) {
                    floatingContents.launchFunc();
                  } else {
                    await turnOnAdPopover(floatingContents.popOverId);
                  }
                }}
              >
                <FloatingContents image={floatingContents.image} borderColor={floatingContents.borderColor} />
              </FloatingButton>
            )}
          </FloatingButtonContainer>
          <FooterCoinPrice coinId={coinId} />
        </FooterContainer>
      }
    >
      {children}
    </BaseLayout>
  );
}
