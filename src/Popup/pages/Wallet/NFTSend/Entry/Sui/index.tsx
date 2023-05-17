import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InputAdornment } from '@mui/material';
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
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, minus, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { suiAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { SuiChain } from '~/types/chain';

import { BottomContainer, Container, Div, StyledInput } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type SuiProps = {
  chain: SuiChain;
};

const DEFAULT_GAS_BUDGET = 20000;

export default function Sui({ chain }: SuiProps) {
  const { t } = useTranslation();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enQueue } = useCurrentQueue();

  const { chromeStorage } = useChromeStorage();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { currency } = chromeStorage;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { coinGeckoId } = currentSuiNetwork;

  const feeCoinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const params = useParams();

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

  const { nftObjects } = useNFTObjectsSWR({ network: currentSuiNetwork, address }, { suspense: true });

  const { tokenBalanceObjects: suiAvailableCoins } = useTokenBalanceObjectsSWR({ address });

  const availableNFTObjects = useMemo(
    () => nftObjects.filter((item) => item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer),
    [nftObjects],
  );

  const availableNFTObjectsIds = useMemo(() => availableNFTObjects.map((object) => object.data?.objectId), [availableNFTObjects]);

  const [currentNFTObjectId] = useState<string | undefined>(availableNFTObjectsIds.includes(params.id || '') ? params.id : availableNFTObjectsIds[0]);

  const currentNFTObject = useMemo(
    () => nftObjects.find((item) => isEqualsIgnoringCase(item.data?.objectId, currentNFTObjectId)),
    [currentNFTObjectId, nftObjects],
  );

  const currentFeeCoin = useMemo(() => suiAvailableCoins.find((object) => object.coinType === SUI_COIN), [suiAvailableCoins]);

  const currentFeeCoinBalance = useMemo(() => currentFeeCoin?.balance || '0', [currentFeeCoin]);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: currentFeeCoin?.coinType });

  const feeCoinDecimals = useMemo(
    () => coinMetadata?.result?.decimals || (currentFeeCoin?.coinType === SUI_COIN ? currentSuiNetwork.decimals : SUI_TOKEN_TEMPORARY_DECIMALS),
    [coinMetadata?.result?.decimals, currentFeeCoin?.coinType, currentSuiNetwork.decimals],
  );

  const [recipientAddress, setRecipientAddress] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  // const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  // const isOpenPopover = Boolean(popoverAnchorEl);

  const sendTxBlock = useMemo<TransactionBlockType | undefined>(() => {
    if (!currentNFTObject?.data?.objectId || !recipientAddress) {
      return undefined;
    }

    const tx = new TransactionBlock();
    tx.transferObjects([tx.object(currentNFTObject.data.objectId)], tx.pure(recipientAddress));
    return tx;
  }, [recipientAddress, currentNFTObject?.data?.objectId]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionBlockSWR({ rawSigner, transactionBlock: sendTxBlock });

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

    if (gt(expectedBaseFee || '0', currentFeeCoinBalance)) {
      return t('pages.Wallet.NFTSend.Entry.Sui.index.insufficientAmount');
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
    dryRunTransactionError?.message,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    t,
  ]);

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
            placeholder={t('pages.Wallet.NFTSend.Entry.Sui.index.recipientAddressPlaceholder')}
            onChange={(e) => setRecipientAddress(e.currentTarget.value)}
            value={recipientAddress}
          />
        </Div>
        <Div sx={{ marginTop: '0.8rem' }}>
          {/* {currentCoinType && (
            <CoinButton
              coinType={currentCoinType}
              isActive={isOpenPopover}
              chain={chain}
              onClick={(event) => {
                setPopoverAnchorEl(event.currentTarget);
              }}
            />
          )} */}
          {currentNFTObject?.data?.objectId}
        </Div>
        <Div>{expectedDisplayFee}</Div>
        <Div>{expectedDisplayFeePrice}</Div>

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
                        method: 'sui_signAndExecuteTransactionBlock',
                        params: [{ transactionBlockSerialized: sendTxBlock.serialize() }],
                      },
                    });
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
      {/* <CoinPopover
        marginThreshold={0}
        currentCoinType={currentCoinType}
        open={isOpenPopover}
        chain={chain}
        onClose={() => setPopoverAnchorEl(null)}
        onClickCoin={(coinType) => {
          if (currentCoinType !== coinType) {
            setCurrentCoinType(coinType);
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
      /> */}
    </>
  );
}

// NOTE need sui suspense component
