import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { InputAdornment, Typography } from '@mui/material';

import { ERC721_ABI } from '~/constants/abi';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { EthereumChain } from '~/types/chain';
import type { ERC721ContractMethods } from '~/types/ethereum/contract';

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

  const { chromeStorage } = useChromeStorage();

  const { currentAccount } = useCurrentAccount();

  const { currency } = chromeStorage;

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { coinGeckoId, decimals, displayDenom } = currentEthereumNetwork;

  const params = useParams();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { currentEthereumNFTs } = useCurrentEthereumNFTs();

  const availableNFTs = useMemo(() => currentEthereumNFTs.filter((item) => item.tokenType === 'ERC721'), [currentEthereumNFTs]);

  const availableNFTIds = useMemo(() => availableNFTs.map((nft) => nft.id), [availableNFTs]);

  const [currentNFTId, setCurrentNFTId] = useState<string | undefined>(availableNFTIds.includes(params.id || '') ? params.id : availableNFTIds[0]);

  const currentNFT = useMemo(
    () => currentEthereumNFTs.find((item) => isEqualsIgnoringCase(item.id, currentNFTId)) || null,
    [currentEthereumNFTs, currentNFTId],
  );

  const fee = useFeeSWR();

  const balance = useBalanceSWR();

  const feeCoinBaseBalance = useMemo(() => BigInt(balance.data?.result || '0').toString(10), [balance.data?.result]);

  const feeCoinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const feeCoinDecimals = useMemo(() => decimals, [decimals]);

  const feeCoinDisplayDenom = useMemo(() => displayDenom, [displayDenom]);

  const [recipientAddress, setRecipientAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  // NOTE need fix
  const sendTx = useMemo(() => {
    if (currentNFT === null) {
      return {
        from: address,
        to: recipientAddress,
        // value: amount,
      };
    }

    const provider = new Web3.providers.HttpProvider(currentEthereumNetwork.rpcURL, {
      headers: [
        {
          name: 'Cosmostation',
          value: `extension/${String(process.env.VERSION)}`,
        },
      ],
    });
    const web3 = new Web3(provider);

    const contract = new web3.eth.Contract(ERC721_ABI as AbiItem[], currentNFT.address);
    const methods = contract.methods as ERC721ContractMethods;

    // NOTE ethers.js로 encodeAbi대응되는 메서드가 있는 지 확인
    const data = ethereumAddressRegex.test(recipientAddress) ? methods.transferFrom(address, recipientAddress, currentNFT.tokenId).encodeABI() : undefined;

    return {
      from: address,
      to: currentNFT.address,
      data,
    };
  }, [address, currentEthereumNetwork.rpcURL, currentNFT, recipientAddress]);

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
    if (!ethereumAddressRegex.test(recipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAddress');
    }

    if (address.toLowerCase() === recipientAddress.toLowerCase()) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAddress');
    }

    if (feeCoinBaseBalance === '0') {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.invalidAmount');
    }

    if (gt(expectedBaseFee, feeCoinBaseBalance)) {
      return t('pages.Wallet.NFTSend.Entry.Ethereum.index.insufficientAmount');
    }

    return '';
  }, [address, expectedBaseFee, feeCoinBaseBalance, recipientAddress, t]);

  return (
    <>
      <Container>
        <Div>
          {currentNFTId && (
            <NFTButton
              nftId={currentNFTId}
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

        <FeeContainer>
          <FeeInfoContainer>
            <FeeLeftContainer>
              <Typography variant="h5">{t('pages.Wallet.NFTSend.Entry.Ethereum.index.fee')}</Typography>
            </FeeLeftContainer>
            <FeeRightContainer>
              <FeeRightColumnContainer>
                <FeeRightAmountContainer>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {expectedDisplayFee}
                  </Number>
                  &nbsp;
                  <Typography variant="h5n">{feeCoinDisplayDenom}</Typography>
                </FeeRightAmountContainer>
                <FeeRightValueContainer>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                    {expectedDisplayFeePrice}
                  </Number>
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
                  if (sendTx) {
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
                  }
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
        currentNFTId={currentNFTId}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        onClickNFT={(nftId) => {
          if (currentNFTId !== nftId) {
            setCurrentNFTId(nftId);
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
