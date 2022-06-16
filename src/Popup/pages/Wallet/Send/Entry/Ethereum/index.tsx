import { useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { InputAdornment, Typography } from '@mui/material';

import { ERC20_ABI } from '~/constants/abi';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { toHex } from '~/Popup/utils/common';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import type { EthereumChain } from '~/types/chain';
import type { Token } from '~/types/ethereum/common';
import type { ERC20ContractMethods } from '~/types/ethereum/contract';

import CoinButton from './components/CoinButton';
import CoinPopover from './components/CoinPopover';
import { BottomContainer, Container, Div, MaxButton, StyledInput } from './styled';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { enQueue } = useCurrentQueue();

  const accounts = useAccounts(true);
  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';
  const { t } = useTranslation();

  const [isDisabled, setIsDisabled] = useState(false);
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentToken, setCurrentToken] = useState<Token>(null);

  const fee = useFeeSWR();

  const balance = useBalanceSWR();
  const tokenBalance = useTokenBalanceSWR(currentToken);

  const [currentAddress, setCurrentAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const decimals = useMemo(() => {
    if (currentToken === null) {
      return currentEthereumNetwork.decimals;
    }

    return currentToken.decimals;
  }, [currentToken, currentEthereumNetwork]);

  const baseAmount = useMemo(() => toBaseDenomAmount(currentDisplayAmount || '0', decimals), [currentDisplayAmount, decimals]);

  const sendTx = useMemo(() => {
    const amount = toHex(toBaseDenomAmount(currentDisplayAmount || '0', decimals), { addPrefix: true, isStringNumber: true });
    if (currentToken === null) {
      return {
        from: address,
        to: currentAddress,
        value: amount,
      };
    }

    const web3 = new Web3(currentEthereumNetwork.rpcURL);

    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], currentToken.address);
    const methods = contract.methods as ERC20ContractMethods;

    const data = ethereumAddressRegex.test(currentAddress) ? methods.transfer(currentAddress, amount).encodeABI() : undefined;

    return {
      from: address,
      to: currentToken.address,
      data,
    };
  }, [address, decimals, currentAddress, currentDisplayAmount, currentEthereumNetwork, currentToken]);

  const estimateGas = useEstimateGasSWR([sendTx]);

  const estimateGasMutate = useDebouncedCallback(() => {
    void estimateGas.mutate();

    setIsDisabled(false);
  }, 1000);

  const baseFeePerGas = useMemo(() => {
    if (fee.type === 'BASIC') return fee.currentGasPrice || '0';
    if (fee.type === 'EIP-1559') return fee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [fee]);

  const baseEstimateGas = useMemo(() => BigInt(estimateGas.data?.result || '21000').toString(10), [estimateGas]);

  const baseFee = useMemo(() => times(baseFeePerGas, baseEstimateGas), [baseFeePerGas, baseEstimateGas]);

  const baseBalance = useMemo(() => BigInt(balance.data?.result || '0').toString(10), [balance]);

  const baseTokenBalance = useMemo(() => BigInt(tokenBalance.data || '0').toString(10), [tokenBalance]);

  const errorMessage = useMemo(() => {
    if (!ethereumAddressRegex.test(currentAddress)) {
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
  }, [baseBalance, baseAmount, baseFee, currentToken, baseTokenBalance, currentAddress, t]);

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
    <>
      <Container>
        <Div>
          <StyledInput
            endAdornment={
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setIsOpenedAddressBook(true)}>
                  <AddressBook24Icon />
                </IconButton>
              </InputAdornment>
            }
            placeholder={t('pages.Wallet.Send.Entry.Ethereum.index.recipientAddressPlaceholder')}
            onChange={(e) => setCurrentAddress(e.currentTarget.value)}
            value={currentAddress}
          />
        </Div>
        <Div sx={{ marginTop: '0.8rem' }}>
          <CoinButton
            currentToken={currentToken}
            isActive={isOpenPopover}
            onClick={(event) => {
              setPopoverAnchorEl(event.currentTarget);
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
      </Container>
      <CoinPopover
        marginThreshold={0}
        currentToken={currentToken}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        onClickCoin={(token) => {
          if (currentToken?.id !== token?.id) {
            setCurrentToken(token);
            setCurrentDisplayAmount('');
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
