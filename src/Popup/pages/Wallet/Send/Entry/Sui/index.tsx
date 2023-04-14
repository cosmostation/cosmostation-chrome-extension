import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import type { TransactionBlock as TransactionBlockType } from '@mysten/sui.js';
import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } from '@mysten/sui.js';

import { SUI_COIN, SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useDryRunTransactionBlockSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionBlockSWR';
import { useGetAllBalancesSWR } from '~/Popup/hooks/SWR/sui/useGetAllBalancesSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetCoinsSWR } from '~/Popup/hooks/SWR/sui/useGetCoinsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, isDecimal, lte, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { suiAddressRegex } from '~/Popup/utils/regex';
import type { SuiChain } from '~/types/chain';

import CoinButton from './components/CoinButton';
import CoinPopover from './components/CoinPopover';
import { BottomContainer, Container, Div, MaxButton, StyledInput } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type SuiProps = {
  chain: SuiChain;
};

const DEFAULT_GAS_BUDGET = 20000;

export default function Sui({ chain }: SuiProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const params = useParams();

  const { t } = useTranslation();
  const { enQueue } = useCurrentQueue();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const provider = useMemo(
    () =>
      new JsonRpcProvider(
        new Connection({
          fullnode: currentSuiNetwork.rpcURL,
        }),
      ),
    [currentSuiNetwork.rpcURL],
  );

  const keypair = useMemo(() => Ed25519Keypair.fromSecretKey(keyPair!.privateKey!), [keyPair]);

  const rawSigner = useMemo(() => new RawSigner(keypair, provider), [keypair, provider]);

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { data: allCoinBalances } = useGetAllBalancesSWR({ address }, { suspense: true });

  const suiAvailableCoins = useMemo(() => allCoinBalances?.result || [], [allCoinBalances?.result]);

  const suiAvailableCoinTypes = useMemo(() => suiAvailableCoins.map((object) => object.coinType), [suiAvailableCoins]);

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');

  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(
    suiAvailableCoinTypes.includes(params.id || '') ? params.id : suiAvailableCoinTypes.includes(SUI_COIN) ? SUI_COIN : suiAvailableCoinTypes[0],
  );

  const [debouncedCurrentDisplayAmount] = useDebounce(currentDisplayAmount, 700);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: currentCoinType }, { suspense: true });

  const decimals = useMemo(
    () => (coinMetadata?.result?.decimals || currentCoinType === SUI_COIN ? currentSuiNetwork.decimals : SUI_TOKEN_TEMPORARY_DECIMALS),
    [coinMetadata?.result?.decimals, currentCoinType, currentSuiNetwork.decimals],
  );

  const [currentAddress, setCurrentAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const currentCoin = useMemo(() => suiAvailableCoins.find((object) => object.coinType === currentCoinType), [currentCoinType, suiAvailableCoins]);

  const currentCoinBaseAmount = useMemo(() => currentCoin?.totalBalance || '0', [currentCoin]);

  const currentCoinDisplayAmount = useMemo(() => toDisplayDenomAmount(currentCoinBaseAmount, decimals), [currentCoinBaseAmount, decimals]);

  const baseAmount = useMemo(() => toBaseDenomAmount(debouncedCurrentDisplayAmount || '0', decimals), [debouncedCurrentDisplayAmount, decimals]);

  const { data: ownedEqualCoins } = useGetCoinsSWR({ address, coinType: currentCoinType });

  const filteredOwnedEqualCoins = useMemo(() => ownedEqualCoins?.result?.data.filter((item) => !item.lockedUntilEpoch), [ownedEqualCoins?.result?.data]);

  const sendTx = useMemo<TransactionBlockType | undefined>(() => {
    if (!debouncedCurrentDisplayAmount) {
      return undefined;
    }
    const tx = new TransactionBlock();

    const [primaryCoin, ...mergeCoins] = filteredOwnedEqualCoins?.filter((coin) => coin.coinType === currentCoinType) || [];

    if (currentCoinType === SUI_COIN) {
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(baseAmount)]);

      tx.transferObjects([coin], tx.pure(currentAddress));
    } else if (primaryCoin) {
      const primaryCoinInput = tx.object(primaryCoin.coinObjectId);
      if (mergeCoins.length) {
        tx.mergeCoins(
          primaryCoinInput,
          mergeCoins.map((coin) => tx.object(coin.coinObjectId)),
        );
      }
      const coin = tx.splitCoins(primaryCoinInput, [tx.pure(baseAmount)]);
      tx.transferObjects([coin], tx.pure(currentAddress));
    }

    return tx;
  }, [baseAmount, currentAddress, currentCoinType, debouncedCurrentDisplayAmount, filteredOwnedEqualCoins]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionBlockSWR({ rawSigner, transaction: sendTx });

  const currentGasBudget = useMemo(() => {
    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      const baseBudget = Number(times(cost, 2));

      return baseBudget;
    }

    return DEFAULT_GAS_BUDGET;
  }, [dryRunTransaction]);

  const errorMessage = useMemo(() => {
    if (!suiAddressRegex.test(currentAddress)) {
      return t('pages.Wallet.Send.Entry.Sui.index.invalidAddress');
    }

    if (address.toLowerCase() === currentAddress.toLowerCase()) {
      return t('pages.Wallet.Send.Entry.Sui.index.invalidAddress');
    }

    if (currentCoinBaseAmount === '0') {
      return t('pages.Wallet.Send.Entry.Sui.index.invalidAmount');
    }

    if (lte(debouncedCurrentDisplayAmount || '0', '0')) {
      return t('pages.Wallet.Send.Entry.Sui.index.invalidAmount');
    }

    if (gt(debouncedCurrentDisplayAmount || '0', currentCoinDisplayAmount)) {
      return t('pages.Wallet.Send.Entry.Sui.index.insufficientAmount');
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return 'Unknown error';
    }

    return '';
  }, [
    address,
    currentAddress,
    currentCoinBaseAmount,
    currentCoinDisplayAmount,
    debouncedCurrentDisplayAmount,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    t,
  ]);

  const handleOnClickMax = () => {
    if (currentCoinType === SUI_COIN) {
      const currentDisplayBudget = toDisplayDenomAmount(currentGasBudget, decimals);

      const displayAmount = minus(currentCoinDisplayAmount, currentDisplayBudget);
      setCurrentDisplayAmount(gt(displayAmount, '0') ? displayAmount : '0');
    } else {
      setCurrentDisplayAmount(currentCoinDisplayAmount);
    }
  };

  return (
    <>
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
            placeholder={t('pages.Wallet.Send.Entry.Sui.index.recipientAddressPlaceholder')}
            onChange={(e) => setCurrentAddress(e.currentTarget.value)}
            value={currentAddress}
          />
        </Div>
        <Div sx={{ marginTop: '0.8rem' }}>
          {currentCoinType && (
            <CoinButton
              coinType={currentCoinType}
              isActive={isOpenPopover}
              chain={chain}
              onClick={(event) => {
                setPopoverAnchorEl(event.currentTarget);
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
            placeholder={t('pages.Wallet.Send.Entry.Sui.index.amountPlaceholder')}
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
                  if (!currentCoinType) {
                    return;
                  }

                  if (sendTx) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'sui_signAndExecuteTransactionBlock',
                        params: [sendTx.serialize()],
                      },
                    });
                  }
                }}
              >
                {t('pages.Wallet.Send.Entry.Sui.index.sendButton')}
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
      </Container>
      <CoinPopover
        marginThreshold={0}
        currentCoinType={currentCoinType}
        open={isOpenPopover}
        chain={chain}
        onClose={() => setPopoverAnchorEl(null)}
        onClickCoin={(coinType) => {
          if (currentCoinType !== coinType) {
            setCurrentCoinType(coinType);
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
