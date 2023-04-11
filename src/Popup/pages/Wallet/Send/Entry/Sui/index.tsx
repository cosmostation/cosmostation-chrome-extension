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

  const suiCoinObjects = useMemo(() => allBalances?.result || [], [allBalances?.result]);

  const suiCoinNames = useMemo(() => suiCoinObjects.map((object) => object.coinType), [suiCoinObjects]);

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(suiCoinNames.includes(params.id || '') ? params.id : suiCoinNames[0]);

  const [debouncedCurrentDisplayAmount] = useDebounce(currentDisplayAmount, 700);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: currentCoinType }, { suspense: true });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const [currentAddress, setCurrentAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const currentCoinObjects = useMemo(() => suiCoinObjects.find((object) => object.coinType === currentCoinType), [currentCoinType, suiCoinObjects]);

  const currentCoinBaseAmount = useMemo(() => currentCoinObjects?.totalBalance || '0', [currentCoinObjects]);

  const currentCoinDisplayAmount = useMemo(() => toDisplayDenomAmount(currentCoinBaseAmount, decimals), [currentCoinBaseAmount, decimals]);

  // NOTE From Ethos
  // const testTxBlock = useMemo(() => {
  //   const transactionBlock = new TransactionBlock();

  //   const baseAmount = toBaseDenomAmount(debouncedCurrentDisplayAmount || '0', decimals);

  //   if (currentCoinType === SUI_COIN) {
  //     const coin = transactionBlock.splitCoins(transactionBlock.gas, [transactionBlock.pure(baseAmount)]);
  //     transactionBlock.transferObjects([coin], transactionBlock.pure(currentAddress));
  //   } else {
  //     const primaryCoinInput = transactionBlock.object(currentCoinType);
  //     if (mergeCoins.length) {
  //       transactionBlock.mergeCoins(
  //         primaryCoinInput,
  //         mergeCoins.map((coin) => transactionBlock.object(Coin.getID(coin))),
  //       );
  //     }
  //     const coinToTransfer = transactionBlock.splitCoins(primaryCoinInput, [transactionBlock.pure(baseAmount)]);
  //     transactionBlock.transferObjects([coinToTransfer], transactionBlock.pure(currentAddress));
  //   }
  //   return transactionBlock;
  // }, [currentAddress, currentCoinType, debouncedCurrentDisplayAmount, decimals]);

  const sendTx = useMemo<TransactionBlockType | undefined>(() => {
    if (!debouncedCurrentDisplayAmount) {
      return undefined;
    }
    const tx = new TransactionBlock();

    const baseAmount = toBaseDenomAmount(debouncedCurrentDisplayAmount || '0', decimals);

    const txPure = tx.pure(baseAmount);

    const [coin] = tx.splitCoins(tx.gas, [txPure]);

    tx.transferObjects([coin], tx.pure(currentAddress));

    return tx;
  }, [currentAddress, debouncedCurrentDisplayAmount, decimals]);

  // NOTE dry run에 쓰이는 transaction은 타입이 다른가?
  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionSWR({ rawSigner, transaction: sendTx });

  // const clonedTransaction = useMemo(() => {
  //   if (!sendTx) return undefined;

  //   const tx = new TransactionBlock(sendTx);
  //   if (address) {
  //     tx.setSenderIfNotSet(address);
  //   }
  //   return tx;
  // }, [sendTx, address]);

  // const txData = useCallback(async () => {
  //   try {
  //     await clonedTransaction?.build({ provider });
  //     return clonedTransaction?.blockData;
  //   } catch (e) {
  //     return null;
  //   }
  // }, [clonedTransaction, provider]);
  // console.log('🚀 ~ file: index.tsx:138 ~ Sui ~ aaa:', aaa.data?.gasConfig.budget);

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

    // NOTE 수이 월렛에서는 해당 메서드가 전부 주석처리 되어있음
    // if (dryRunTransaction?.effects.status.status !== 'success') {
    //   return 'Unknown error';
    // }

    return '';
  }, [address, currentAddress, currentCoinBaseAmount, currentCoinDisplayAmount, debouncedCurrentDisplayAmount, dryRunTransactionError?.message, t]);

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
