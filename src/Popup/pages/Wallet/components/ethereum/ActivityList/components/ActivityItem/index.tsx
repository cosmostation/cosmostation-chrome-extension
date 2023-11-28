import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { ETHEREUM_ACTIVITY_TYPE } from '~/constants/extensionStorage';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { convertToLocales, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';
import type { ActivityData } from '~/types/extensionStorage';

import {
  Container,
  LeftContainer,
  LeftIconContainer,
  LeftTextContainer,
  LeftTextSubtitleContainer,
  LeftTextTitleContainer,
  RightContainer,
  RightTextContainer,
  StyledButton,
} from './styled';

import Check24Icon from '~/images/icons/Check24.svg';
import Contract24Icon from '~/images/icons/Contract24.svg';
import NFTSend24Icon from '~/images/icons/NFTSend24.svg';
import Send24Icon from '~/images/icons/Send24.svg';
import Swap24Icon from '~/images/icons/Swap24.svg';
import Transaction24Icon from '~/images/icons/Transaction24.svg';

type ActivityItemProps = {
  activity: ActivityData;
  displayAmount: string;
  displayDenom: string;
  decimals?: number;
};

export default function ActivityItem({ activity, displayAmount, displayDenom, decimals }: ActivityItemProps) {
  const { t } = useTranslation();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { extensionStorage } = useExtensionStorage();
  const { language } = extensionStorage;

  const { explorerURL } = currentEthereumNetwork;
  const { txHash, timestamp, type } = activity;

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/tx/${txHash}` : ''), [explorerURL, txHash]);

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString(convertToLocales(language), {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [language, timestamp]);

  const shortenedToAddress = useMemo(() => shorterAddress(activity.toAddress || txHash, 11), [activity.toAddress, txHash]);

  const trasactionIcon = useMemo(() => {
    if (type === ETHEREUM_ACTIVITY_TYPE.SIMPLE_SEND || type === ETHEREUM_ACTIVITY_TYPE.TRANSFER || type === ETHEREUM_ACTIVITY_TYPE.TRANSFER_FROM) {
      return <Send24Icon />;
    }

    if (type === ETHEREUM_ACTIVITY_TYPE.SWAP) {
      return <Swap24Icon />;
    }

    if (type === ETHEREUM_ACTIVITY_TYPE.ERC721_TRANSFER_FROM || type === ETHEREUM_ACTIVITY_TYPE.ERC1155_SAFE_TRANSFER_FROM) {
      return <NFTSend24Icon />;
    }

    if (type === ETHEREUM_ACTIVITY_TYPE.APPROVE) {
      return <Check24Icon />;
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.CONTRACT_INTERACT || type === ETHEREUM_ACTIVITY_TYPE.DEPLOY) {
      return <Contract24Icon />;
    }

    return <Transaction24Icon />;
  }, [type]);

  const title = useMemo(() => {
    if (type === ETHEREUM_ACTIVITY_TYPE.SIMPLE_SEND) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.send');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.TRANSFER) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transfer');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transferFrom');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.SWAP) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.swap');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.ERC721_TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.erc721TransferFrom');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.ERC1155_SAFE_TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.erc1155SafeTransferFrom');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.APPROVE) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.approve');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.CONTRACT_INTERACT) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.contractInteract');
    }
    if (type === ETHEREUM_ACTIVITY_TYPE.DEPLOY) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.deploy');
    }

    return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transaction');
  }, [t, type]);

  return (
    <StyledButton onClick={() => window.open(txDetailExplorerURL)} disabled={!txDetailExplorerURL}>
      <Tooltip
        title={!txDetailExplorerURL ? t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.noExplorerURL') : ''}
        varient="error"
        placement="top"
        arrow
      >
        <Container>
          <LeftContainer>
            <LeftIconContainer data-is-contract={type === ETHEREUM_ACTIVITY_TYPE.CONTRACT_INTERACT || type === ETHEREUM_ACTIVITY_TYPE.DEPLOY}>
              {trasactionIcon}
            </LeftIconContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{title}</Typography>
              </LeftTextTitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{shortenedToAddress}</Typography>
              </LeftTextSubtitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{formattedTimestamp}</Typography>
              </LeftTextSubtitleContainer>
            </LeftTextContainer>
          </LeftContainer>
          <RightContainer>
            {gt(displayAmount, '0') && displayDenom && (
              <RightTextContainer>
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(decimals)}>
                  {displayAmount}
                </NumberText>
                <Typography variant="h6">{displayDenom}</Typography>
              </RightTextContainer>
            )}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
