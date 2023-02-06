import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import type { UnserializedSignableTransaction } from '@mysten/sui.js';
import { Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui.js';

import { SUI_COIN } from '~/constants/sui';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useDryRunTransactionSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, isDecimal, lte, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { suiAddressRegex } from '~/Popup/utils/regex';
import { getCoinType, isExists } from '~/Popup/utils/sui';
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

  const provider = useMemo(() => new JsonRpcProvider(currentSuiNetwork.rpcURL), [currentSuiNetwork.rpcURL]);

  const keypair = useMemo(() => Ed25519Keypair.fromSeed(keyPair!.privateKey!), [keyPair]);

  const rawSigner = useMemo(() => new RawSigner(keypair, provider), [keypair, provider]);

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address }, { suspense: true });

  const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) }, { suspense: true });

  const suiCoinObjects = useMemo(() => objects?.filter(isExists).filter((object) => !!object.result?.details.data.fields.balance) || [], [objects]);

  const suiCoinNames = useMemo(
    () => Array.from(new Set(suiCoinObjects.map((object) => getCoinType(object.result?.details.data.type)))).filter((name) => !!name),
    [suiCoinObjects],
  );

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

  const currentCoinObjects = useMemo(
    () => suiCoinObjects.filter((object) => getCoinType(object.result?.details.data.type) === currentCoinType),
    [currentCoinType, suiCoinObjects],
  );

  const currentCoinBaseAmount = useMemo(
    () => currentCoinObjects.reduce((ac, cu) => plus(ac, cu.result?.details.data.fields.balance || '0'), '0'),
    [currentCoinObjects],
  );

  const currentCoinDisplayAmount = useMemo(() => toDisplayDenomAmount(currentCoinBaseAmount, decimals), [currentCoinBaseAmount, decimals]);

  const dryRunTx = useMemo<UnserializedSignableTransaction | undefined>(() => {
    if (
      !suiAddressRegex.test(currentAddress) ||
      address.toLowerCase() === currentAddress.toLowerCase() ||
      currentCoinBaseAmount === '0' ||
      lte(debouncedCurrentDisplayAmount || '0', '0') ||
      gt(debouncedCurrentDisplayAmount || '0', currentCoinDisplayAmount)
    ) {
      return undefined;
    }

    const baseAmount = toBaseDenomAmount(debouncedCurrentDisplayAmount, decimals);

    return {
      kind: currentCoinType === SUI_COIN ? 'paySui' : 'pay',
      data: {
        amounts: [Number(baseAmount)],
        gasBudget: DEFAULT_GAS_BUDGET,
        recipients: [currentAddress],
        inputCoins: currentCoinObjects.map((object) => object.result!.details.data.fields.id.id),
      },
    };
  }, [address, currentAddress, currentCoinBaseAmount, currentCoinDisplayAmount, currentCoinObjects, currentCoinType, debouncedCurrentDisplayAmount, decimals]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionSWR({ rawSigner, transaction: dryRunTx });

  const currentGasBudget = useMemo(() => {
    if (dryRunTx && dryRunTransaction?.status.status === 'success') {
      const storageCost = dryRunTransaction.gasUsed.storageCost - dryRunTransaction.gasUsed.storageRebate;

      const cost = dryRunTransaction.gasUsed.computationCost + (storageCost > 0 ? storageCost : 0);

      const baseBudget = Number(times(cost, 2));

      return baseBudget;
    }

    return DEFAULT_GAS_BUDGET;
  }, [dryRunTransaction, dryRunTx]);

  const tx = useMemo<UnserializedSignableTransaction | undefined>(() => {
    if (dryRunTx && dryRunTransaction?.status.status === 'success') {
      return { kind: dryRunTx.kind, data: { ...dryRunTx.data, gasBudget: currentGasBudget } } as UnserializedSignableTransaction;
    }

    return undefined;
  }, [currentGasBudget, dryRunTransaction?.status.status, dryRunTx]);

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

    if (dryRunTransaction?.status.status !== 'success') {
      return 'Unknown error';
    }

    return '';
  }, [
    address,
    currentAddress,
    currentCoinBaseAmount,
    currentCoinDisplayAmount,
    debouncedCurrentDisplayAmount,
    dryRunTransaction?.status.status,
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

                  if (tx) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'sui_signAndExecuteTransaction',
                        params: [tx],
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
