import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFT721BalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721BalanceSWR';
import { useNFT721CheckSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721CheckSWR';
import { useNFT721OwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721OwnerSWR';
import { useNFT721TokenOfOwnerByIndexSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721TokenOfOwnerByIndexSWR';
import { useNFT721URISWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721URISWR';
import { useNFT1155BalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC1155/useNFT1155BalanceSWR';
import { useNFT1155URISWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC1155/useNFT1155URISWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import type { EthereumChain } from '~/types/chain';

import {
  Container,
  ErrorDescriptionContainer,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineCenterContainer,
  FourthLineContainer,
  SecondLineContainer,
  SecondLineLeftAbsoluteImageContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledAbsoluteLoading,
  StyledIconButton,
  StyledRetryIconButton,
  ThirdLineContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import SendIcon from '~/images/icons/Send.svg';

type NativeChainCardProps = {
  chain: EthereumChain;
  isCustom?: boolean;
};

export default function NativeChainCard({ chain, isCustom }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const accounts = useAccounts(true);
  const balance = useBalanceSWR(undefined, { suspense: true });

  // NOTE Test codes, would be deleted
  const testNFTContractAddress = '0x495f947276749Ce646f68AC8c248420045cb7b5e';
  const tokenId = '76759802801251205939224547784789707739691712882438043889149637722920242380801';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testNFT721ContractAddress = '0x0FCBD68251819928C8f6D182fC04bE733fA94170';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testNFT721TokenId = '2972';

  const miladyNFT721ContractAddress = '0x8182B2010F98FcB4A89738090ED25622780A2452';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const miladyNFT721TokenId = '9837';

  const dooddle = '0x20d93d65ADa7ee46235f95f5995AE5c5dC5AC44c';
  const dooddleTokenId = '13448407947994005218329819046404085674119224815530332939657499008818210288923';

  // NOTE 제작자
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testOwnerAddress = '0x56d4101F5Ee2E5F253aA9e3471a5C08C0fFC87D5';
  const nftHolderAddress = '0x653325aFDb00DD741Fee25a694467eBA17E8e93D';
  // NOTE balanceOf로 보유한 총 nft갯수를 가져온다 -> tokenOfOwnerByIndex를 해당 index만큼 돌려서 리스트를 가져온다.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test1 = useNFT1155URISWR({ contractAddress: testNFTContractAddress, tokenId });

  // const test22 = useNFT1155BalanceBatchSWR({ contractAddress: testNFTContractAddress, ownerAddress: '0x5aB2d1f5069dd2f9aeEC3b0A8e923B1cdbe7Fc44', tokenId });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test33 = useNFT1155BalanceSWR({ contractAddress: testNFTContractAddress, ownerAddress: '0x5aB2d1f5069dd2f9aeEC3b0A8e923B1cdbe7Fc44', tokenId });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test44 = useNFT1155BalanceSWR({ contractAddress: miladyNFT721ContractAddress, tokenId: miladyNFT721TokenId });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const adsfs3123 = useNFT721CheckSWR({ contractAddress: testNFTContractAddress });

  // const adsfs = useNFT1155CheckSWR({ contractAddress: testNFTContractAddress });

  // console.log('🚀 ~ file: index.tsx:114 ~ NativeChainCard ~ adsfs:', adsfs);

  // const testtest = useGetNFTStandardSWR({ contractAddress: testNFTContractAddress });

  // console.log('🚀 ~ file: index.tsx:117 ~ NativeChainCard ~ testtest:', testtest);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const test2 = useNFT721BalanceSWR({ contractAddress: testNFT721ContractAddress, ownerAddress: testOwnerAddress });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testHolder = useNFT721BalanceSWR({ contractAddress: miladyNFT721ContractAddress, ownerAddress: nftHolderAddress });

  // NOTE return OwnerAddress
  // NOTE uri swr과 키값이 동일함
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testOwner = useNFT721OwnerSWR({ contractAddress: testNFT721ContractAddress, tokenId: testNFT721TokenId });

  // NOTE need erc1155 ownerOF method

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testGetNFT = useNFT721TokenOfOwnerByIndexSWR({
    contractAddress: miladyNFT721ContractAddress,
    ownerAddress: nftHolderAddress,
    quantity: 20,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test3 = useNFT721URISWR({ contractAddress: dooddle, tokenId: dooddleTokenId });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const aaa = useGetNFTMetaSWR(test3.data);

  const { t } = useTranslation();

  const { navigate } = useNavigate();

  const { coinGeckoId, decimals, explorerURL, imageURL } = currentEthereumNetwork;

  const { data } = useCoinGeckoPriceSWR();

  const amount = BigInt(balance?.data?.result || '0').toString();

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(price, displayAmount);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.ethereum.NativeChainCard.index.copied'));
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{currentAddress}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${currentAddress}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{currentEthereumNetwork.displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Tooltip title={displayAmount} arrow placement="bottom-end">
            <span>
              <Number fixed={getDisplayMaxDecimals(decimals)}>{displayAmount}</Number>
            </span>
          </Tooltip>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, displayDenom, imageURL } = currentEthereumNetwork;

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(`copied!`);
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${address}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Skeleton width="12rem" height="2.6rem" />
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Skeleton width="8rem" height="1.9rem" />
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardError({ chain, isCustom, resetErrorBoundary }: NativeChainCardProps & FallbackProps) {
  useBalanceSWR();

  const [isLoading, setIsloading] = useState(false);

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, displayDenom, imageURL } = currentEthereumNetwork;

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(`copied!`);
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${address}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <StyledRetryIconButton
            onClick={() => {
              setIsloading(true);

              setTimeout(() => {
                resetErrorBoundary();
                setIsloading(false);
              }, 500);
            }}
          >
            <RetryIcon />
          </StyledRetryIconButton>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <ErrorDescriptionContainer>
          <Typography variant="h6">{t('pages.Wallet.components.ethereum.NativeChainCard.index.networkError')}</Typography>
        </ErrorDescriptionContainer>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
        </Button>
      </FourthLineContainer>
      {isLoading && <StyledAbsoluteLoading size="2.5rem" />}
    </Container>
  );
}

type DisplayDenomImageProps = {
  imageURL?: string;
  isCustom?: boolean;
};

function SecondLineLeftImage({ imageURL, isCustom = false }: DisplayDenomImageProps) {
  return (
    <SecondLineLeftImageContainer>
      <SecondLineLeftAbsoluteImageContainer>
        <Image src={imageURL} />
      </SecondLineLeftAbsoluteImageContainer>
      {isCustom && (
        <SecondLineLeftAbsoluteImageContainer>
          <Image src={customBeltImg} />
        </SecondLineLeftAbsoluteImageContainer>
      )}
    </SecondLineLeftImageContainer>
  );
}
