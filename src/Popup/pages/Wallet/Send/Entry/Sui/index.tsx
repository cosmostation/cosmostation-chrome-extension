import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import type { TransactionBlock as TransactionBlockType } from '@mysten/sui.js';
import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } from '@mysten/sui.js';

import { SUI_COIN } from '~/constants/sui';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useDryRunTransactionSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionSWR';
import { useGetAllBalancesSWR } from '~/Popup/hooks/SWR/sui/useGetAllBalancesSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal, gt, isDecimal, lte, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
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

  const connection_testnet = useMemo(
    () =>
      new Connection({
        fullnode: currentSuiNetwork.rpcURL,
        faucet: 'https://fullnode.testnet.sui.io/gas',
      }),
    [currentSuiNetwork.rpcURL],
  );

  const provider = useMemo(() => new JsonRpcProvider(connection_testnet), [connection_testnet]);

  const keypair = useMemo(() => Ed25519Keypair.fromSecretKey(keyPair!.privateKey!), [keyPair]);

  const rawSigner = useMemo(() => new RawSigner(keypair, provider), [keypair, provider]);

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { data: allBalances } = useGetAllBalancesSWR({ address }, { suspense: true });

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({
    address,
    query: { options: { showType: true, showDisplay: true } },
  });

  const suiCoinCoins = useMemo(() => allBalances?.result || [], [allBalances?.result]);

  const suiCoinTypes = useMemo(() => suiCoinCoins.map((object) => object.coinType), [suiCoinCoins]);

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');

  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(
    suiCoinTypes.includes(params.id || '') ? params.id : suiCoinTypes.find((coinType) => coinType === SUI_COIN) ? SUI_COIN : suiCoinTypes[0],
  );

  const [debouncedCurrentDisplayAmount] = useDebounce(currentDisplayAmount, 700);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: currentCoinType }, { suspense: true });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const [currentAddress, setCurrentAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const currentCoin = useMemo(() => suiCoinCoins.find((object) => object.coinType === currentCoinType), [currentCoinType, suiCoinCoins]);

  const currentCoinBaseAmount = useMemo(() => currentCoin?.totalBalance || '0', [currentCoin]);

  const currentCoinDisplayAmount = useMemo(() => toDisplayDenomAmount(currentCoinBaseAmount, decimals), [currentCoinBaseAmount, decimals]);

  const baseAmount = useMemo(() => toBaseDenomAmount(debouncedCurrentDisplayAmount || '0', decimals), [debouncedCurrentDisplayAmount, decimals]);

  const isPayAllSui = useMemo(() => equal(baseAmount, currentCoinBaseAmount), [baseAmount, currentCoinBaseAmount]);

  const sendTx = useMemo<TransactionBlockType | undefined>(() => {
    if (!debouncedCurrentDisplayAmount) {
      return undefined;
    }
    const tx = new TransactionBlock();

    if (isPayAllSui && currentCoinType === SUI_COIN && objectsOwnedByAddress?.result) {
      tx.transferObjects([tx.gas], tx.pure(currentAddress));
      tx.setGasPayment(
        objectsOwnedByAddress.result.data
          .filter((coin) => coin.data.type === currentCoinType)
          .map((coin) => ({
            objectId: coin.data.objectId,
            digest: coin.data.digest,
            version: coin.data.version,
          })),
      );
      return tx;
    }

    const [primaryCoin, ...mergeCoins] = objectsOwnedByAddress!.result!.data.filter((coin) => coin.data.type === currentCoinType);

    if (currentCoinType === SUI_COIN) {
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(baseAmount)]);

      tx.transferObjects([coin], tx.pure(currentAddress));
    } else {
      const primaryCoinInput = tx.object(primaryCoin.data.objectId);
      if (mergeCoins.length) {
        tx.mergeCoins(
          primaryCoinInput,
          mergeCoins.map((coin) => tx.object(coin.data.objectId)),
        );
      }
      const coin = tx.splitCoins(primaryCoinInput, [tx.pure(baseAmount)]);
      tx.transferObjects([coin], tx.pure(currentAddress));
    }

    return tx;
  }, [baseAmount, currentAddress, currentCoinType, debouncedCurrentDisplayAmount, isPayAllSui, objectsOwnedByAddress]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionSWR({ rawSigner, transaction: sendTx });

  const currentGasBudget = useMemo(() => {
    if (dryRunTransaction?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.effects.gasUsed.storageCost, dryRunTransaction.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

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

    if (dryRunTransaction?.effects.status.status !== 'success') {
      return 'Unknown error';
    }

    return '';
  }, [
    address,
    currentAddress,
    currentCoinBaseAmount,
    currentCoinDisplayAmount,
    debouncedCurrentDisplayAmount,
    dryRunTransaction?.effects.status.status,
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
