import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AddressActionButtons from '@/components/AddressActionButtons';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import StaleBalanceErrorBanner from '@/components/StaleBalanceErrorBanner';
import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Receive } from '@/pages/wallet/receive/$coinId';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import { getCoinId, getUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, removeTemplateLiteral, removeTrailingSlash } from '@/utils/string';

import MoreOptionBottomSheet from './components/MoreOptionBottomSheet';
import ValueButtonWrapper from './components/ValueButtonWrapper';
import { BottomButtonContainer, IconContainer, SpacedTypography, StyledIconTextButton, TopContainer } from './styled';
import MainBox from '..';

import DaoIcon from '@/assets/images/icons/Dao28.svg';
import MoreIcon from '@/assets/images/icons/More22.svg';
import ReceiveIcon from '@/assets/images/icons/Receive22.svg';
import SendIcon from '@/assets/images/icons/Send22.svg';
import SwapIcon from '@/assets/images/icons/Swap22.svg';
import VaultIcon from '@/assets/images/icons/Vault28.svg';
import VoteIcon from '@/assets/images/icons/Vote28.svg';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type CoinDetailBoxProps = {
  coinId: string;
};

export default function CoinDetailBox({ coinId }: CoinDetailBoxProps) {
  const [isOpenMoreOptionBottomSheet, setIsOpenMoreOptionBottomSheet] = useState(false);
  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accountAllAssets, getAccountAsset } = useGetAccountAsset({ coinId });

  const currentCoin = getAccountAsset();

  const coinImage = currentCoin?.asset.image;

  const isNativeCoin = currentCoin?.asset.id === currentCoin?.chain.mainAssetDenom;

  const cosmosStyleCoin = useMemo(() => {
    const isEthermint = currentCoin?.chain.chainType === 'evm' && currentCoin.chain.isCosmos;

    const isMainCoin = isEqualsIgnoringCase(currentCoin?.asset.id, NATIVE_EVM_COIN_ADDRESS);

    if (isEthermint && isMainCoin) {
      return accountAllAssets?.cosmosAccountAssets.find(
        (item) =>
          item.asset.id === currentCoin.chain.mainAssetDenom &&
          item.chain.id === currentCoin.chain.id &&
          item.address.chainId === currentCoin.address.chainId &&
          item.address.accountType.hdPath === currentCoin.address.accountType.hdPath,
      );
    }

    return undefined;
  }, [accountAllAssets?.cosmosAccountAssets, currentCoin]);

  const voteURL = currentCoin?.chain.explorer?.proposal;
  const formattedVoteURL = voteURL && removeTrailingSlash(removeTemplateLiteral(voteURL));

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId || '').chainId);

  const moreOptionProps = (() => {
    if (isNTRN) {
      return [
        {
          icon: <VaultIcon />,
          title: t('components.MainBox.CoinDetailBox.index.vault'),
          subTitle: t('components.MainBox.CoinDetailBox.index.vaultDescription'),
          onClick: () => {
            window.open(`https://www.mintscan.io/${parseCoinId(coinId || '').chainId}/dao/vault?sector=vault`, '_blank');
          },
        },
        {
          icon: <DaoIcon />,
          title: t('components.MainBox.CoinDetailBox.index.dao'),
          subTitle: t('components.MainBox.CoinDetailBox.index.daoDescription'),
          onClick: () => {
            window.open(`https://www.mintscan.io/${parseCoinId(coinId || '').chainId}/dao/vault?sector=proposals`, '_blank');
          },
        },
      ];
    }

    return undefined;
  })();

  const swapDappURL = useMemo(() => {
    if (currentCoin?.chain.chainType === 'cosmos' && currentCoin.chain.isSupportHistory) {
      return 'https://www.mintscan.io/wallet/swap';
    }

    return undefined;
  }, [currentCoin?.chain]);

  const hanldeOnClickSend = () => {
    if (cosmosStyleCoin) {
      setIsOpenBottomSheet(true);
    } else {
      navigate({
        to: Send.to,
        params: { coinId: coinId },
      });
    }
  };

  const hanldeOnClickReceive = () => {
    navigate({
      to: Receive.to,
      params: { coinId: coinId },
    });
  };

  const hanldeOnEthermintSend = useCallback(
    (val: 'cosmos' | 'evm') => {
      if (!currentCoin) return;

      if (val === 'cosmos') {
        if (cosmosStyleCoin) {
          const cosmosStyleCoinId = getCoinId(cosmosStyleCoin.asset);

          navigate({
            to: Send.to,
            params: { coinId: cosmosStyleCoinId },
          });
        }
      } else {
        navigate({
          to: Send.to,
          params: { coinId: coinId },
        });
      }
    },
    [coinId, cosmosStyleCoin, currentCoin, navigate],
  );

  return (
    <>
      {currentCoin?.lastUpdatedAtMs && <StaleBalanceErrorBanner chainId={getUniqueChainId(currentCoin.chain)} lastUpdatedAtMs={currentCoin.lastUpdatedAtMs} />}
      <MainBox
        top={
          <TopContainer>
            <AddressActionButtons coinId={coinId} variant="underline" typoVarient="h6n_M" />
          </TopContainer>
        }
        body={<ValueButtonWrapper currentCoin={currentCoin} />}
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton
              onClick={hanldeOnClickSend}
              leadingIcon={
                <IconContainer>
                  <SendIcon />
                </IconContainer>
              }
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.send')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={hanldeOnClickReceive}
              leadingIcon={
                <IconContainer>
                  <ReceiveIcon />
                </IconContainer>
              }
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.receive')}</SpacedTypography>
            </StyledIconTextButton>
            {swapDappURL && (
              <StyledIconTextButton
                onClick={() => {
                  window.open(swapDappURL, '_blank');
                }}
                leadingIcon={
                  <IconContainer>
                    <SwapIcon />
                  </IconContainer>
                }
                direction="vertical"
              >
                <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.swap')}</SpacedTypography>
              </StyledIconTextButton>
            )}
            {isNativeCoin && formattedVoteURL && (
              <StyledIconTextButton
                onClick={() => {
                  window.open(formattedVoteURL, '_blank');
                }}
                leadingIcon={
                  <IconContainer>
                    <VoteIcon />
                  </IconContainer>
                }
                direction="vertical"
              >
                <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.vote')}</SpacedTypography>
              </StyledIconTextButton>
            )}
            {moreOptionProps && (
              <StyledIconTextButton
                onClick={() => {
                  setIsOpenMoreOptionBottomSheet(true);
                }}
                leadingIcon={
                  <IconContainer>
                    <MoreIcon />
                  </IconContainer>
                }
                direction="vertical"
              >
                <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.more')}</SpacedTypography>
              </StyledIconTextButton>
            )}
          </BottomButtonContainer>
        }
        className="circleGradient"
        bgImageClassName="coinDetail"
        coinBackgroundImage={coinImage || DefaultCoinImage}
      />
      {cosmosStyleCoin && (
        <EthermintSendBottomSheet
          open={isOpenBottomSheet}
          onClose={() => setIsOpenBottomSheet(false)}
          bech32AddressPrefix={cosmosStyleCoin.chain.accountPrefix + 1}
          onSelectOption={hanldeOnEthermintSend}
        />
      )}
      {moreOptionProps && (
        <MoreOptionBottomSheet open={isOpenMoreOptionBottomSheet} onClose={() => setIsOpenMoreOptionBottomSheet(false)} buttonProps={moreOptionProps} />
      )}
    </>
  );
}
