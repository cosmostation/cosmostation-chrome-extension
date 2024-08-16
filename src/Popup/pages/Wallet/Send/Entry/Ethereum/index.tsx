import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { InputAdornment, Typography } from '@mui/material';

import { ERC20_ABI } from '~/constants/abi';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEnsSWR } from '~/Popup/hooks/SWR/ethereum/useEnsSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useParamsSWR } from '~/Popup/hooks/SWR/ethereum/useParamsSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import { toHex } from '~/Popup/utils/string';
import type { EthereumChain } from '~/types/chain';
import type { Token } from '~/types/ethereum/common';
import type { ERC20ContractMethods } from '~/types/ethereum/contract';

import CoinButton from './components/CoinButton';
import CoinListBottomSheet from './components/CoinListBottomSheet';
import { Address, AddressContainer, BottomContainer, CheckAddressIconContainer, Container, Div, MaxButton, StyledInput } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import CheckAddress16Icon from '~/images/icons/CheckAddress16.svg';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentEthereumTokens } = useCurrentEthereumTokens();

  const params = useParams();

  const chainParams = useParamsSWR(currentEthereumNetwork);

  const { enQueue } = useCurrentQueue();

  const accounts = useAccounts(true);
  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const { t } = useTranslation();

  const [isDisabled, setIsDisabled] = useState(false);
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentToken, setCurrentToken] = useState<Token>(currentEthereumTokens.find((item) => item.id === params.id) || null);

  const fee = useFeeSWR();

  const balance = useBalanceSWR();
  const tokenBalance = useTokenBalanceSWR({ token: currentToken });

  const [currentAddress, setCurrentAddress] = useState('');
  const [debouncedCurrentAddress] = useDebounce(currentAddress, 500);
  const ens = useEnsSWR(currentEthereumNetwork, debouncedCurrentAddress);

  const nameResolvedAddress = useMemo(() => ens?.data, [ens.data]);

  const toAddress = useMemo(() => ens.data || debouncedCurrentAddress, [debouncedCurrentAddress, ens.data]);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);
  const [isOpenedCoinList, setIsOpenedCoinList] = useState(false);

  const decimals = useMemo(() => {
    if (currentToken === null) {
      return currentEthereumNetwork.decimals;
    }

    return currentToken.decimals;
  }, [currentEthereumNetwork.decimals, currentToken]);

  const baseAmount = useMemo(() => toBaseDenomAmount(currentDisplayAmount || '0', decimals), [currentDisplayAmount, decimals]);

  const sendTx = useMemo(() => {
    const amount = toHex(toBaseDenomAmount(currentDisplayAmount || '0', decimals), { addPrefix: true, isStringNumber: true });
    if (currentToken === null) {
      return {
        from: address,
        to: toAddress,
        value: amount,
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

    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], currentToken.address);
    const methods = contract.methods as ERC20ContractMethods;

    const data = ethereumAddressRegex.test(toAddress) ? methods.transfer(toAddress, amount).encodeABI() : undefined;

    return {
      from: address,
      to: currentToken.address,
      data,
    };
  }, [address, currentDisplayAmount, currentEthereumNetwork.rpcURL, currentToken, decimals, toAddress]);

  const estimateGas = useEstimateGasSWR([sendTx]);

  const estimateGasMutate = useDebouncedCallback(() => {
    void estimateGas.mutate();

    setIsDisabled(false);
  }, 1000);

  const baseFeePerGas = useMemo(() => {
    if (fee.type === 'BASIC') return fee.currentGasPrice || '0';
    if (fee.type === 'EIP-1559') return fee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [fee.currentFee?.average.maxBaseFeePerGas, fee.currentGasPrice, fee.type]);

  const baseEstimateGas = useMemo(() => BigInt(estimateGas.data?.result || '21000').toString(10), [estimateGas.data?.result]);

  const baseFee = useMemo(() => times(baseFeePerGas, baseEstimateGas), [baseFeePerGas, baseEstimateGas]);

  const baseBalance = useMemo(() => BigInt(balance.data?.result || '0').toString(10), [balance.data?.result]);

  const baseTokenBalance = useMemo(() => BigInt(tokenBalance.data || '0').toString(10), [tokenBalance.data]);

  const errorMessage = useMemo(() => {
    if (chainParams.data?.params?.chainlist_params?.isBankLocked) {
      return t('pages.Wallet.Send.Entry.Ethereum.index.bankLocked');
    }

    if (!ethereumAddressRegex.test(toAddress)) {
      return t('pages.Wallet.Send.Entry.Ethereum.index.invalidAddress');
    }

    if (address.toLowerCase() === toAddress.toLowerCase()) {
      return t('pages.Wallet.Send.Entry.Ethereum.index.invalidAddress');
    }

    if (baseAmount === '0') {
      return t('pages.Wallet.Send.Entry.Ethereum.index.invalidAmount');
    }

    if (currentToken === null) {
      const total = plus(baseAmount, baseFee);

      if (gt(total, baseBalance)) {
        return t('pages.Wallet.Send.Entry.Ethereum.index.insufficientAmount');
      }
    } else {
      if (gt(baseFee, baseBalance)) {
        return t('pages.Wallet.Send.Entry.Ethereum.index.insufficientFee');
      }

      if (gt(baseAmount, baseTokenBalance)) {
        return t('pages.Wallet.Send.Entry.Ethereum.index.insufficientAmount');
      }
    }

    return '';
  }, [address, baseAmount, baseBalance, baseFee, baseTokenBalance, chainParams.data?.params?.chainlist_params?.isBankLocked, currentToken, t, toAddress]);

  const handleOnClickMax = () => {
    if (currentToken === null) {
      const fee15 = times(baseFee, '1.5');
      const maxAmount = minus(baseBalance, fee15);

      setCurrentDisplayAmount(gt(maxAmount, '0') ? toDisplayDenomAmount(maxAmount, decimals) : '0');
    } else {
      setCurrentDisplayAmount(toDisplayDenomAmount(baseTokenBalance, decimals));
    }
  };

  return (
    <Container>
      <Div>
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
          placeholder={t('pages.Wallet.Send.Entry.Ethereum.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
        {nameResolvedAddress && (
          <AddressContainer>
            <CheckAddressIconContainer>
              <CheckAddress16Icon />
            </CheckAddressIconContainer>
            <Address>
              <Typography variant="h7">{nameResolvedAddress}</Typography>
            </Address>
          </AddressContainer>
        )}
      </Div>
      <Div sx={{ marginTop: '0.8rem' }}>
        <CoinButton
          currentToken={currentToken}
          isActive={isOpenedCoinList}
          onClick={() => {
            setIsOpenedCoinList(true);
          }}
        />
      </Div>
      <Div sx={{ marginTop: '0.8rem' }}>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <MaxButton type="button" onClick={handleOnClickMax}>
                <Typography variant="h7">MAX</Typography>
              </MaxButton>
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Ethereum.index.amountPlaceholder')}
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
              return;
            }

            setIsDisabled(true);

            setCurrentDisplayAmount(e.currentTarget.value);

            estimateGasMutate();
          }}
          value={currentDisplayAmount}
        />
      </Div>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={isDisabled || !!errorMessage}
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

                if (currentAccount.type === 'LEDGER') {
                  await debouncedOpenTab();
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Ethereum.index.sendButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
        }}
      />

      <AccountAddressBookBottomSheet
        open={isOpenedMyAddressBook}
        hasCurrentAccount={false}
        chain={chain}
        onClose={() => setIsOpenedMyAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a);
        }}
      />

      <CoinListBottomSheet
        currentToken={currentToken}
        open={isOpenedCoinList}
        onClose={() => setIsOpenedCoinList(false)}
        onClickCoin={(token) => {
          if (currentToken?.id !== token?.id) {
            setCurrentToken(token);
            setCurrentDisplayAmount('');
          }
        }}
      />
    </Container>
  );
}
