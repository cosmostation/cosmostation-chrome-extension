import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab/index.tsx';
import IconTextButton from '@/components/common/IconTextButton/index.tsx';
import CopyButton from '@/components/CopyButton/index.tsx';
import { ADDRESS_FORMAT_MAPPING } from '@/constants/bitcoin/common.ts';
import { useChainList } from '@/hooks/useChainList.ts';
import { useChangeCoinAccountType } from '@/hooks/useChangeCoinAccountType.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses.ts';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes.ts';
import CoinTypeBottomSheet from '@/pages/manage-assets/switch-accout-type/-components/CoinTypeBottomSheet/index.tsx';
import type { ChainAccountType, UniqueChainId } from '@/types/chain.ts';
import { devLogger } from '@/utils/devLogger.ts';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator.ts';
import { toastError, toastSuccess } from '@/utils/toast.tsx';

import {
  AddressBodyContainer,
  AddressBottomContainer,
  AddressContainer,
  AddressText,
  AddressTopContainer,
  AddressTopTitleContainer,
  BottomLeftCornerContainer,
  BottomRightCornerContainer,
  ChainImage,
  ChevronIconContainer,
  CoinContainer,
  CoinDenomContainer,
  CoinSymbolText,
  Container,
  CornerIconContainer,
  FilledTabContainer,
  InfoIconContainer,
  QRBorderContainer,
  QRContainer,
  TopLeftCornerContainer,
  TopRightCornerContainer,
} from './-styled.tsx';

import BottomLeftCornerStrokeIcon from '@/assets/images/icons/BorderStroke27.svg';
import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import InformationIcon from '@/assets/images/icons/Information14.svg';

type EntryProps = {
  chainId: UniqueChainId;
};

export default function Entry({ chainId }: EntryProps) {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['EVM Style', 'COSMOS Style'];

  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { flatChainList } = useChainList();
  const accountAddress = useCurrentAccountAddresses();
  const { currentAccount } = useCurrentAccount();
  const { changeCoinType } = useChangeCoinAccountType();

  const parsedUniqueChainId = parseUniqueChainId(chainId);

  const multiPath = (() => {
    return currentPreferAccountType?.[parsedUniqueChainId.id];
  })();

  const newChainId = (() => {
    if (parsedUniqueChainId.chainType === 'evm' || parsedUniqueChainId.chainType === 'cosmos') {
      const currentChainAccountType = currentPreferAccountType?.[parsedUniqueChainId.id];

      if (currentChainAccountType) {
        const chainType = currentChainAccountType.pubkeyStyle === 'secp256k1' ? 'cosmos' : 'evm';

        const newUniqueChainId = getUniqueChainIdWithManual(parsedUniqueChainId.id, chainType);
        return newUniqueChainId;
      }
    }

    return chainId;
  })();

  const selectedChain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, newChainId));

  const isEthermint = selectedChain?.chainType === 'evm' && selectedChain.isCosmos;

  const chainAddress = (() => {
    if (isEthermint) {
      if (tabValue === 0) {
        const addr = accountAddress.data?.find((item) => {
          const isSameChain = getUniqueChainIdWithManual(item.chainId, item.chainType) === newChainId;
          const isSameAccountType = multiPath ? item.accountType.hdPath === multiPath.hdPath : true;

          return isSameChain && isSameAccountType;
        });

        return addr;
      }
      if (tabValue === 1) {
        const addr = accountAddress.data?.find((item) => {
          const isSameChain =
            getUniqueChainIdWithManual(item.chainId, item.chainType) === getUniqueChainIdWithManual(parseUniqueChainId(newChainId).id, 'cosmos');
          const isSameAccountType = multiPath ? item.accountType.hdPath === multiPath.hdPath : true;

          return isSameChain && isSameAccountType;
        });

        return addr;
      }
    }

    return accountAddress.data?.find((item) => {
      const isSameChain = getUniqueChainIdWithManual(item.chainId, item.chainType) === newChainId;
      const isSameAccountType = multiPath ? item.accountType.hdPath === multiPath.hdPath : true;

      return isSameChain && isSameAccountType;
    });
  })();

  const currentAccountIndex = currentAccount?.type === 'MNEMONIC' ? currentAccount.index : '0';

  const addressTypeLabel = (() => {
    if (currentAccount.type === 'PRIVATE_KEY') {
      return {
        left: '',
        main: chainAddress?.accountType.pubkeyStyle,
        right: '',
      };
    }

    const fullHdPath = chainAddress?.accountType.hdPath ? chainAddress.accountType.hdPath.replace('${index}', currentAccountIndex) : undefined;
    const isBitcoin = chainAddress?.chainType === 'bitcoin';

    if (fullHdPath) {
      const [rootLevel, purposeLevel, coinTypeLevel, accountLevel, changeLevel, indexLevel] = fullHdPath.split('/');

      const highlightedLeftText = `${rootLevel} / ${isBitcoin ? '' : `${purposeLevel} / `}`;
      const highlightedText = isBitcoin ? purposeLevel : coinTypeLevel;
      const highlightedRightText = ` / ${isBitcoin ? `${coinTypeLevel} / ` : ''}${accountLevel} / ${changeLevel} ${indexLevel ? `/ ${indexLevel}` : ''}`;

      if (selectedChain?.chainType === 'bitcoin') {
        return {
          left: '',
          main: ADDRESS_FORMAT_MAPPING[purposeLevel as keyof typeof ADDRESS_FORMAT_MAPPING],
          right: '',
        };
      }

      return {
        left: highlightedLeftText,
        main: highlightedText,
        right: highlightedRightText,
      };
    }
  })();

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const handleChangeAccountType = useCallback(
    async (id: string, accountType: ChainAccountType) => {
      try {
        await changeCoinType(id, accountType);
        toastSuccess(t('pages.manage-assets.switch-account-type.entry.successSwitch'));
      } catch (error) {
        devLogger.error(`[ChangeAccountType in ChainlistBottomSheet] Error`, error);
        toastError(t('pages.manage-assets.switch-account-type.entry.failSwitch'));
      } finally {
        setIsOpenBottomSheet(false);
      }
    },
    [changeCoinType, t],
  );

  return (
    <BaseBody>
      <Container>
        {isEthermint && (
          <FilledTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </FilledTabContainer>
        )}
        <CoinContainer>
          <CoinSymbolText variant="h2_B">{selectedChain?.name}</CoinSymbolText>
          <CoinDenomContainer>
            <IconTextButton
              onClick={() => {
                setIsOpenBottomSheet(true);
              }}
              disabled={!multiPath}
              trailingIcon={
                multiPath ? (
                  <ChevronIconContainer>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                ) : undefined
              }
            >
              <Base1000Text variant="b4_R">
                {currentAccount.type === 'MNEMONIC' ? `Type :` : `Algo :`}
                &nbsp;
                {addressTypeLabel?.left && (
                  <span>
                    <Base1000Text variant="h6n_M">{addressTypeLabel.left}</Base1000Text>
                  </span>
                )}
                {addressTypeLabel?.main && (
                  <span>
                    <Base1300Text variant="h6n_M">{addressTypeLabel?.main}</Base1300Text>
                  </span>
                )}
                {addressTypeLabel?.right && (
                  <span>
                    <Base1000Text variant="h6n_M">{addressTypeLabel.right}</Base1000Text>
                  </span>
                )}
              </Base1000Text>
            </IconTextButton>
          </CoinDenomContainer>
        </CoinContainer>
        <QRBorderContainer>
          <QRContainer>
            <QRCodeSVG level="H" value={chainAddress?.address || ''} size={200} />
          </QRContainer>
          <BottomLeftCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </BottomLeftCornerContainer>

          <BottomRightCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </BottomRightCornerContainer>

          <TopLeftCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </TopLeftCornerContainer>

          <TopRightCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </TopRightCornerContainer>
          <ChainImage src={selectedChain?.image} />
        </QRBorderContainer>

        <AddressContainer>
          <AddressTopContainer>
            <AddressTopTitleContainer>
              <Base1000Text variant="b3_M">{`${t('pages.wallet.receive.$coinId.entry.myAddress')}
              ${tabValue === 1 && isEthermint ? ' (Cosmos Style)' : ''}`}</Base1000Text>
            </AddressTopTitleContainer>

            <AddressBodyContainer>
              <AddressText variant="b3_M_Multiline">{chainAddress?.address}</AddressText>

              <CopyButton sx={{ width: '2rem', height: '2rem' }} copyString={chainAddress?.address} />
            </AddressBodyContainer>
          </AddressTopContainer>
          <AddressBottomContainer>
            <InfoIconContainer>
              <InformationIcon />
            </InfoIconContainer>
            <Base1000Text variant="b3_R">{t('pages.wallet.receive.$coinId.entry.addressDescription1')}</Base1000Text>
            &nbsp;
            <Base1300Text variant="b3_M">{selectedChain?.name || ''}</Base1300Text>
            &nbsp;
            <Base1000Text variant="b3_R">{t('pages.wallet.receive.$coinId.entry.addressDescription2')}</Base1000Text>
          </AddressBottomContainer>
        </AddressContainer>
      </Container>
      {selectedChain && (
        <CoinTypeBottomSheet
          open={isOpenBottomSheet}
          onClose={() => {
            setIsOpenBottomSheet(false);
          }}
          chain={selectedChain}
          onClickChainType={handleChangeAccountType}
        />
      )}
    </BaseBody>
  );
}
