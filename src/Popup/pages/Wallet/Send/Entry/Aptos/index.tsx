import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InputAdornment, Typography } from '@mui/material';

import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosCoins } from '~/Popup/hooks/useCurrent/useCurrentAptosCoins';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { gt, isDecimal, lte, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { aptosAddressRegex } from '~/Popup/utils/regex';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';
import type { AptosChain } from '~/types/chain';

import CoinButton from './components/CoinButton';
import CoinListBottomSheet from './components/CoinListBottomSheet';
import { BottomContainer, Container, Div, MaxButton, StyledInput } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type AptosProps = {
  chain: AptosChain;
};

export default function Aptos({ chain }: AptosProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentAptosCoins } = useCurrentAptosCoins({ suspense: true });
  const params = useParams();

  const { enQueue } = useCurrentQueue();

  const accounts = useAccounts(true);
  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';
  const { t } = useTranslation();

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentCoin, setCurrentCoin] = useState<X1CoinCoinstore | undefined>(
    currentAptosCoins.find((item) => item.type === params.id) || currentAptosCoins[0],
  );

  const coinAddress = getCoinAddress(currentCoin?.type || '');

  const accountAddress = coinAddress.split('::')[0];

  const { data: coinInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: coinAddress, address: accountAddress });

  const [currentAddress, setCurrentAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);
  const [isOpenedCoinList, setIsOpenedCoinList] = useState(false);

  const decimals = useMemo(() => coinInfo?.data.decimals || 0, [coinInfo?.data.decimals]);

  const currentCoinBaseAmount = useMemo(() => currentCoin?.data.coin.value || '0', [currentCoin?.data.coin.value]);

  const currentCoinDisplayAmount = useMemo(() => toDisplayDenomAmount(currentCoinBaseAmount, decimals), [currentCoinBaseAmount, decimals]);

  const errorMessage = useMemo(() => {
    if (!aptosAddressRegex.test(currentAddress)) {
      return t('pages.Wallet.Send.Entry.Aptos.index.invalidAddress');
    }

    if (address.toLowerCase() === currentAddress.toLowerCase()) {
      return t('pages.Wallet.Send.Entry.Aptos.index.invalidAddress');
    }

    if (currentCoinBaseAmount === '0') {
      return t('pages.Wallet.Send.Entry.Aptos.index.invalidAmount');
    }

    if (lte(currentDisplayAmount || '0', '0')) {
      return t('pages.Wallet.Send.Entry.Aptos.index.invalidAmount');
    }

    if (gt(currentDisplayAmount || '0', currentCoinDisplayAmount)) {
      return t('pages.Wallet.Send.Entry.Aptos.index.insufficientAmount');
    }

    return '';
  }, [address, currentAddress, currentCoinBaseAmount, currentCoinDisplayAmount, currentDisplayAmount, t]);

  const handleOnClickMax = () => {
    setCurrentDisplayAmount(currentCoinDisplayAmount);
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
          placeholder={t('pages.Wallet.Send.Entry.Aptos.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </Div>
      <Div sx={{ marginTop: '0.8rem' }}>
        {currentCoin && (
          <CoinButton
            currentCoin={currentCoin}
            isActive={isOpenedCoinList}
            onClick={() => {
              setIsOpenedCoinList(true);
            }}
          />
        )}
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
          placeholder={t('pages.Wallet.Send.Entry.Aptos.index.amountPlaceholder')}
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
        />
      </Div>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage}
              onClick={async () => {
                if (!currentCoin) {
                  return;
                }

                const baseAmount = toBaseDenomAmount(currentDisplayAmount, decimals);

                if (coinAddress === '0x1::aptos_coin::AptosCoin') {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'aptos_signAndSubmitTransaction',
                      params: [
                        {
                          type: 'entry_function_payload',
                          arguments: [currentAddress, baseAmount],
                          function: '0x1::aptos_account::transfer',
                          type_arguments: [],
                        },
                      ],
                    },
                  });
                } else {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'aptos_signAndSubmitTransaction',
                      params: [
                        {
                          type: 'entry_function_payload',
                          arguments: [currentAddress, baseAmount],
                          function: '0x1::coin::transfer',
                          type_arguments: [coinAddress],
                        },
                      ],
                    },
                  });
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Aptos.index.sendButton')}
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
        currentCoin={currentCoin}
        open={isOpenedCoinList}
        onClose={() => setIsOpenedCoinList(false)}
        onClickCoin={(coin) => {
          if (currentCoin?.type !== coin.type) {
            setCurrentCoin(coin);
            setCurrentDisplayAmount('');
          }
        }}
      />
    </Container>
  );
}
