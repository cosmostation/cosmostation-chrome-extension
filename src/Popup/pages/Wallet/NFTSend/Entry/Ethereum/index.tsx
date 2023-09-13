import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers, FetchRequest } from 'ethers';
import { InputAdornment, Typography } from '@mui/material';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTBalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTBalanceSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTURISWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { ethereumAddressRegex, isNaturalNumberRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { EthereumChain } from '~/types/chain';
import type { EthereumNFT } from '~/types/ethereum/nft';

import NFTButton from './components/NFTButton';
import NFTPopover from './components/NFTPopover';
import {
  BottomContainer,
  Container,
  Div,
  FeeContainer,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  MaxButton,
  StyledInput,
} from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type EthereumProps = {
  chain: EthereumChain;
};

const DEFAULT_GAS_BUDGET = '21000';

export default function Ethereum({ chain }: EthereumProps) {
  const { t } = useTranslation();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enQueue } = useCurrentQueue();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();

  const { currency } = extensionStorage;

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { coinGeckoId, decimals, displayDenom } = currentEthereumNetwork;

  const params = useParams();

  const accounts = useAccounts(true);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const { currentEthereumNFTs } = useCurrentEthereumNFTs();

  const [currentNFT, setCurrentNFT] = useState<EthereumNFT>(
    currentEthereumNFTs.find((item) => isEqualsIgnoringCase(item.id, params.id)) || currentEthereumNFTs[0],
  );

  const { data: currentNFTBalance } = useGetNFTBalanceSWR({
    contractAddress: currentNFT.address,
    ownerAddress: address,
    tokenId: currentNFT.tokenId,
    tokenStandard: currentNFT.tokenType,
  });

  const { data: nftSourceURI } = useGetNFTURISWR({ contractAddress: currentNFT.address, tokenId: currentNFT.tokenId, tokenStandard: currentNFT.tokenType });

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: currentNFT.address, tokenId: currentNFT.tokenId, tokenStandard: currentNFT.tokenType });

  const fee = useFeeSWR();

  const balance = useBalanceSWR();

  const feeCoinBaseBalance = useMemo(() => BigInt(balance.data?.result || '0').toString(10), [balance.data?.result]);

  const feeCoinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const feeCoinDecimals = useMemo(() => decimals, [decimals]);

  const feeCoinDisplayDenom = useMemo(() => displayDenom, [displayDenom]);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [currentSendQuantity, setCurrentSendQuantity] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const sendTx = useMemo(() => {
    if (currentNFT === null) {
      return {
        from: address,
        to: recipientAddress,
      };
    }

    const customFetchRequest = new FetchRequest(currentEthereumNetwork.rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);

    if (currentNFT.tokenType === 'ERC721') {
      const erc721Contract = new ethers.Contract(currentNFT.address, ERC721_ABI, provider);

      const data = ethereumAddressRegex.test(recipientAddress)
        ? erc721Contract.interface.encodeFunctionData('transferFrom', [address, recipientAddress, currentNFT.tokenId])
        : undefined;

      return {
        from: address,
        to: currentNFT.address,
        data,
      };
    }
    if (currentNFT.tokenType === 'ERC1155' && nftSourceURI && currentSendQuantity) {
      const erc1155Contract = new ethers.Contract(currentNFT.address, ERC1155_ABI, provider);

      const data = ethereumAddressRegex.test(recipientAddress)
        ? erc1155Contract.interface.encodeFunctionData('safeTransferFrom', [
            address,
            recipientAddress,
            currentNFT.tokenId,
            Number(currentSendQuantity),
            `${ethers.hexlify(ethers.toUtf8Bytes(`${nftSourceURI}`))}`,
          ])
        : undefined;

      return {
        from: address,
        to: currentNFT.address,
        data,
      };
    }

    return {
      from: address,
      to: recipientAddress,
    };
  }, [address, currentEthereumNetwork.rpcURL, currentNFT, currentSendQuantity, nftSourceURI, recipientAddress]);

  const estimateGas = useEstimateGasSWR([sendTx]);

  const baseFeePerGas = useMemo(() => {
    if (fee.type === 'BASIC') return fee.currentGasPrice || '0';
    if (fee.type === 'EIP-1559') return fee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [fee.currentFee?.average.maxBaseFeePerGas, fee.currentGasPrice, fee.type]);

  const baseEstimateGas = useMemo(() => BigInt(estimateGas.data?.result || DEFAULT_GAS_BUDGET).toString(10), [estimateGas.data?.result]);

  const expectedBaseFee = useMemo(() => times(baseFeePerGas, baseEstimateGas), [baseFeePerGas, baseEstimateGas]);

  const expectedDisplayFee = useMemo(() => toDisplayDenomAmount(expectedBaseFee, feeCoinDecimals), [feeCoinDecimals, expectedBaseFee]);

  const expectedDisplayFeePrice = useMemo(() => times(expectedDisplayFee, feeCoinPrice), [expectedDisplayFee, feeCoinPrice]);

  const errorMessage = useMemo(() => {
    if (!isOwnedNFT) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.notOwnedNFT');
    }
    if (!ethereumAddressRegex.test(recipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAddress');
    }

    if (isEqualsIgnoringCase(address, recipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAddress');
    }

    if (feeCoinBaseBalance === '0') {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAmount');
    }

    if (gt(expectedBaseFee, feeCoinBaseBalance)) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.insufficientAmount');
    }

    if (currentNFT.tokenType === 'ERC1155') {
      if (!currentNFTBalance || !nftSourceURI) {
        return t('pages.Wallet.NFTSend.Entry.Ethereum.index.networkError');
      }

      if (!currentSendQuantity || gt(currentSendQuantity, currentNFTBalance) || !isNaturalNumberRegex.test(currentSendQuantity)) {
        return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidSendNFTQuantity');
      }
    }

    return '';
  }, [
    address,
    currentNFT.tokenType,
    currentNFTBalance,
    currentSendQuantity,
    expectedBaseFee,
    feeCoinBaseBalance,
    isOwnedNFT,
    nftSourceURI,
    recipientAddress,
    t,
  ]);

  return (
    <>
      <Container>
        <Div>
          {currentNFT && (
            <NFTButton
              currentNFT={currentNFT}
              isActive={isOpenPopover}
              onClick={(event) => {
                setPopoverAnchorEl(event.currentTarget);
              }}
            />
          )}
        </Div>

        <Div sx={{ marginTop: '0.8rem' }}>
          <StyledInput
            endAdornment={
              <>
                <InputAdornment position="end">
                  <InputAdornmentIconButton onClick={() => setIsOpenedMyAddressBook(true)}>
                    <AccountAddressIcon />
                  </InputAdornmentIconButton>
                </InputAdornment>
                <InputAdornment position="start">
                  <InputAdornmentIconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                    <AddressBook24Icon />
                  </InputAdornmentIconButton>
                </InputAdornment>
              </>
            }
            placeholder={t('pages.Wallet.NFTSend.Entry.Ethereum.index.recipientAddressPlaceholder')}
            onChange={(e) => setRecipientAddress(e.currentTarget.value)}
            value={recipientAddress}
          />
        </Div>
        {currentNFT.tokenType === 'ERC1155' && (
          <Div sx={{ marginTop: '0.8rem' }}>
            <StyledInput
              placeholder={t('pages.Wallet.NFTSend.Entry.Ethereum.index.quantityPlaceholder')}
              endAdornment={
                <InputAdornment position="end">
                  <MaxButton
                    type="button"
                    onClick={() => {
                      setCurrentSendQuantity(currentNFTBalance || '');
                    }}
                  >
                    <Typography variant="h7">MAX</Typography>
                  </MaxButton>
                </InputAdornment>
              }
              onChange={(e) => {
                if (e.currentTarget.value && !isNaturalNumberRegex.test(e.currentTarget.value)) {
                  return;
                }
                setCurrentSendQuantity(e.currentTarget.value);
              }}
              value={currentSendQuantity}
            />
          </Div>
        )}

        <FeeContainer>
          <FeeInfoContainer>
            <FeeLeftContainer>
              <Typography variant="h5">{t('pages.Wallet.NFTSend.Entry.Ethereum.index.fee')}</Typography>
            </FeeLeftContainer>
            <FeeRightContainer>
              <FeeRightColumnContainer>
                <FeeRightAmountContainer>
                  <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {expectedDisplayFee}
                  </NumberText>
                  &nbsp;
                  <Typography variant="h5n">{feeCoinDisplayDenom}</Typography>
                </FeeRightAmountContainer>
                <FeeRightValueContainer>
                  <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                    {expectedDisplayFeePrice}
                  </NumberText>
                </FeeRightValueContainer>
              </FeeRightColumnContainer>
            </FeeRightContainer>
          </FeeInfoContainer>
        </FeeContainer>

        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                type="button"
                disabled={!!errorMessage}
                onClick={async () => {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'eth_sendTransaction',
                      params: [
                        {
                          ...sendTx,
                          gas: toHex(baseEstimateGas, { addPrefix: true, isStringNumber: true }),
                        },
                      ],
                    },
                  });
                }}
              >
                {t('pages.Wallet.NFTSend.Entry.Ethereum.index.sendButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>

        <AddressBookBottomSheet
          open={isOpenedAddressBook}
          onClose={() => setIsOpenedAddressBook(false)}
          onClickAddress={(a) => {
            setRecipientAddress(a.address);
          }}
        />

        <AccountAddressBookBottomSheet
          open={isOpenedMyAddressBook}
          hasCurrentAccount={false}
          chain={chain}
          onClose={() => setIsOpenedMyAddressBook(false)}
          onClickAddress={(a) => {
            setRecipientAddress(a);
          }}
        />
      </Container>
      <NFTPopover
        marginThreshold={0}
        currentNFT={currentNFT}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        onClickNFT={(nft) => {
          if (currentNFT !== nft) {
            setCurrentNFT(nft);
            setCurrentSendQuantity('');
          }
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </>
  );
}
