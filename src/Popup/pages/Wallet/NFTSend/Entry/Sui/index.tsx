import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InputAdornment, Typography } from '@mui/material';
import type { Transaction as TransactionType } from '@mysten/sui/transactions';
import { Transaction } from '@mysten/sui/transactions';

import { SUI_COIN, SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useDryRunTransactionBlockSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionBlockSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, minus, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { suiAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { SuiChain } from '~/types/chain';

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

type SuiProps = {
  chain: SuiChain;
};

const DEFAULT_GAS_BUDGET = '20000';

export default function Sui({ chain }: SuiProps) {
  const { t } = useTranslation();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enQueue } = useCurrentQueue();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();

  const { currency } = extensionStorage;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { coinGeckoId } = currentSuiNetwork;

  const params = useParams();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { nftObjects } = useNFTObjectsSWR({ network: currentSuiNetwork, address }, { suspense: true });

  const { tokenBalanceObjects: suiAvailableCoins } = useTokenBalanceObjectsSWR({ address });

  const availableNFTObjects = useMemo(
    () => nftObjects.filter((item) => item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer),
    [nftObjects],
  );

  const availableNFTObjectsIds = useMemo(() => availableNFTObjects.map((object) => object.data?.objectId), [availableNFTObjects]);

  const [currentNFTObjectId, setCurrentNFTObjectId] = useState<string | undefined>(
    availableNFTObjectsIds.includes(params.id || '') ? params.id : availableNFTObjectsIds[0],
  );

  const currentNFTObject = useMemo(
    () => nftObjects.find((item) => isEqualsIgnoringCase(item.data?.objectId, currentNFTObjectId)),
    [currentNFTObjectId, nftObjects],
  );

  const currentFeeCoin = useMemo(() => suiAvailableCoins.find((object) => object.coinType === SUI_COIN), [suiAvailableCoins]);

  const currentFeeCoinBalance = useMemo(() => currentFeeCoin?.balance || '0', [currentFeeCoin]);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: currentFeeCoin?.coinType });

  const feeCoinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const feeCoinDecimals = useMemo(
    () => coinMetadata?.result?.decimals || (currentFeeCoin?.coinType === SUI_COIN ? currentSuiNetwork.decimals : SUI_TOKEN_TEMPORARY_DECIMALS),
    [coinMetadata?.result?.decimals, currentFeeCoin?.coinType, currentSuiNetwork.decimals],
  );

  const feeCoinDisplayDenom = useMemo(
    () => coinMetadata?.result?.symbol || (currentFeeCoin?.coinType === SUI_COIN ? currentSuiNetwork.displayDenom : ''),
    [coinMetadata?.result?.symbol, currentFeeCoin?.coinType, currentSuiNetwork.displayDenom],
  );

  const [recipientAddress, setRecipientAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const sendTxBlock = useMemo<TransactionType | undefined>(() => {
    if (
      !currentNFTObject?.data?.objectId ||
      !recipientAddress ||
      !(currentNFTObject.data.content?.dataType === 'moveObject' && currentNFTObject.data.content.hasPublicTransfer)
    ) {
      return undefined;
    }

    const tx = new Transaction();
    tx.setSenderIfNotSet(address);
    tx.transferObjects([tx.object(currentNFTObject.data.objectId)], recipientAddress);
    return tx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNFTObject?.data?.objectId, currentNFTObject?.data?.content?.dataType, recipientAddress]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionBlockSWR({ transaction: sendTxBlock });

  const expectedBaseFee = useMemo(() => {
    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      return String(cost);
    }

    return DEFAULT_GAS_BUDGET;
  }, [dryRunTransaction]);

  const expectedDisplayFee = useMemo(() => toDisplayDenomAmount(expectedBaseFee, feeCoinDecimals), [feeCoinDecimals, expectedBaseFee]);

  const expectedDisplayFeePrice = useMemo(() => times(expectedDisplayFee, feeCoinPrice), [expectedDisplayFee, feeCoinPrice]);

  const errorMessage = useMemo(() => {
    if (!suiAddressRegex.test(recipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Sui.index.invalidAddress');
    }

    if (address.toLowerCase() === recipientAddress.toLowerCase()) {
      return t('pages.Wallet.NFTSend.Entry.Sui.index.invalidAddress');
    }

    if (currentFeeCoinBalance === '0') {
      return t('pages.Wallet.NFTSend.Entry.Sui.index.invalidAmount');
    }

    if (gt(expectedBaseFee, currentFeeCoinBalance)) {
      return t('pages.Wallet.NFTSend.Entry.Sui.index.insufficientAmount');
    }

    if (dryRunTransaction?.error?.message) {
      return dryRunTransaction?.error?.message;
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
    recipientAddress,
    address,
    currentFeeCoinBalance,
    expectedBaseFee,
    dryRunTransaction?.error?.message,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    t,
  ]);

  return (
    <>
      <Container>
        <Div>
          {currentNFTObjectId && (
            <NFTButton
              nftObjectId={currentNFTObjectId}
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
            placeholder={t('pages.Wallet.NFTSend.Entry.Sui.index.recipientAddressPlaceholder')}
            onChange={(e) => setRecipientAddress(e.currentTarget.value)}
            value={recipientAddress}
          />
        </Div>

        <FeeContainer>
          <FeeInfoContainer>
            <FeeLeftContainer>
              <Typography variant="h5">{t('pages.Wallet.NFTSend.Entry.Sui.index.fee')}</Typography>
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
                  if (!currentNFTObjectId || !sendTxBlock) {
                    return;
                  }

                  if (sendTxBlock) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'sui_signAndExecuteTransaction',
                        params: [
                          {
                            transactionBlockSerialized: await sendTxBlock.toJSON(),
                            options: {
                              showRawEffects: true,
                              showRawInput: true,
                            },
                          },
                        ],
                      },
                    });

                    if (currentAccount.type === 'LEDGER') {
                      await debouncedOpenTab();
                    }
                  }
                }}
              >
                {t('pages.Wallet.NFTSend.Entry.Sui.index.sendButton')}
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
        currentNFTObjectId={currentNFTObjectId}
        open={isOpenPopover}
        chain={chain}
        onClose={() => setPopoverAnchorEl(null)}
        onClickNFT={(nftObjectId) => {
          if (currentNFTObjectId !== nftObjectId) {
            setCurrentNFTObjectId(nftObjectId);
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
