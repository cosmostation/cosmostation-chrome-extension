import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { IN_APP_ETHEREUM_TRANSACTION_TYPE } from '~/constants/extensionStorage';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { Activity } from '~/types/extensionStorage';

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
import IBCSend24Icon from '~/images/icons/IBCSend24.svg';
import NFTSend24Icon from '~/images/icons/NFTSend24.svg';
import Send24Icon from '~/images/icons/Send24.svg';
import Swap24Icon from '~/images/icons/Swap24.svg';

type ActivityItemProps = {
  activity: Activity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { t } = useTranslation();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { explorerURL } = currentEthereumNetwork;
  const { txHash, timestamp, type } = activity;

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/tx/${txHash}` : ''), [explorerURL, txHash]);

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [timestamp]);

  const sampleToAddress = 'stars1aygdt8742gamxv8ca99wzh56ry4xw5s33vvxu2';

  const shorterToAddress = useMemo(() => shorterAddress(sampleToAddress, 11), []);

  // NOTE 필요한 아이콘(24픽셀) 1. 트랜잭션 디폴트 아이콘(우상향 하는 아이콘이었으면 함) 2. 컨트랙트 실행 아이콘
  const trasactionIcon = useMemo(() => {
    if (
      type === IN_APP_ETHEREUM_TRANSACTION_TYPE.SIMPLE_SEND ||
      type === IN_APP_ETHEREUM_TRANSACTION_TYPE.TRANSFER ||
      type === IN_APP_ETHEREUM_TRANSACTION_TYPE.TRANSFER_FROM
    ) {
      return <Send24Icon />;
    }

    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.SWAP) {
      return <Swap24Icon />;
    }

    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.ERC721_TRANSFER_FROM || type === IN_APP_ETHEREUM_TRANSACTION_TYPE.ERC1155_SAFE_TRANSFER_FROM) {
      return <NFTSend24Icon />;
    }

    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.APPROVE) {
      return <Check24Icon />;
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.CONTRACT_INTERACT || type === IN_APP_ETHEREUM_TRANSACTION_TYPE.DEPLOY) {
      return <Contract24Icon />;
    }

    // NOTE need default icon
    return <IBCSend24Icon />;
  }, [type]);

  const title = useMemo(() => {
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.SIMPLE_SEND) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.send');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.TRANSFER) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transfer');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transferFrom');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.SWAP) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.swap');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.ERC721_TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.erc721TransferFrom');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.ERC1155_SAFE_TRANSFER_FROM) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.erc1155SafeTransferFrom');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.APPROVE) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.approve');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.CONTRACT_INTERACT) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.contractInteract');
    }
    if (type === IN_APP_ETHEREUM_TRANSACTION_TYPE.DEPLOY) {
      return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.deploy');
    }

    return t('pages.Wallet.components.ethereum.ActivityList.components.ActivityItem.index.transaction');
  }, [t, type]);

  const transactionAmount = useMemo(() => '1', []);

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
            <LeftIconContainer>{trasactionIcon}</LeftIconContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{title}</Typography>
              </LeftTextTitleContainer>
              <>
                <LeftTextSubtitleContainer>
                  <Typography variant="h6">{shorterToAddress}</Typography>
                </LeftTextSubtitleContainer>
                <LeftTextSubtitleContainer>
                  <Typography variant="h6">{formattedTimestamp}</Typography>
                </LeftTextSubtitleContainer>
              </>
            </LeftTextContainer>
          </LeftContainer>
          <RightContainer>
            {transactionAmount ? (
              <RightTextContainer>
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {transactionAmount}
                </NumberText>
                <Typography variant="h6">Default</Typography>
              </RightTextContainer>
            ) : (
              <RightTextContainer>
                <Typography variant="h6">-</Typography>
              </RightTextContainer>
            )}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
