import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_DEFAULT_SEND_GAS, COSMOS_DEFAULT_TRANSFER_GAS } from '~/constants/chain';
import { SHENTU } from '~/constants/chain/cosmos/shentu';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import DropdownButton from '~/Popup/components/common/DropdownButton';
import IconButton from '~/Popup/components/common/IconButton';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useGasRateSWR } from '~/Popup/hooks/SWR/cosmos/useGasRateSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentFeeCoinList } from '~/Popup/hooks/useCurrent/useCurrentFeeCoinList';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx } from '~/Popup/utils/proto';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain, CosmosToken as BaseCosmosToken, GasRateKey } from '~/types/chain';

import { BottomContainer, Container, MarginTop8Div, MarginTop12Div, MarginTop16Div, MaxButton, StyledInput, StyledTextarea } from './styled';
import CoinOrTokenPopover from '../CoinOrTokenPopover';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

export type CoinInfo = BaseCoinInfo & { type: typeof TYPE.COIN };
export type TokenInfo = BaseCosmosToken & { type: typeof TYPE.TOKEN };

export type CoinOrTokenInfo = CoinInfo | TokenInfo;

type CosmosProps = {
  chain: CosmosChain;
};

export default function Send({ chain }: CosmosProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();
  const assetGasRate = useGasRateSWR(chain);

  const { t } = useTranslation();

  const { currentCosmosTokens } = useCurrentCosmosTokens();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gas, gasRate } = chain;

  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );

  const availableCoinOrTokenList: CoinOrTokenInfo[] = useMemo(
    () => [
      ...coinAll.filter((item) => gt(item.availableAmount, '0')).map((item) => ({ ...item, type: TYPE.COIN })),
      ...currentCosmosTokens.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item, type: TYPE.TOKEN })),
    ],
    [coinAll, currentCosmosTokens],
  );

  const [currentCoinOrTokenId, setCurrentCoinOrTokenId] = useState(params.id || chain.baseDenom);

  const [currentAddress, setCurrentAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39]), [chain.bech32Prefix.address]);

  const currentCoinOrToken = useMemo(
    () =>
      availableCoinOrTokenList.find(
        (item) => (item.type === 'coin' && item.baseDenom === currentCoinOrTokenId) || (item.type === 'token' && item.address === currentCoinOrTokenId),
      )!,
    [availableCoinOrTokenList, currentCoinOrTokenId],
  );

  const sendGas = currentCoinOrToken.type === 'coin' ? gas.send || COSMOS_DEFAULT_SEND_GAS : gas.transfer || COSMOS_DEFAULT_TRANSFER_GAS;

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [currentGasRateKey, setCurrentGasRateKey] = useState<GasRateKey>('low');

  const [currentFeeAmount, setCurrentFeeAmount] = useState(times(sendGas, gasRate[currentGasRateKey]));

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentCeilFeeAmount, decimals);

  const tokenBalance = useTokenBalanceSWR(chain, currentCoinOrTokenId, address);

  const currentCoinOrTokenAvailableAmount = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      return currentCoinOrToken.availableAmount;
    }

    return tokenBalance.data?.balance || '0';
  }, [currentCoinOrToken, tokenBalance.data?.balance]);

  const currentCoinOrTokenDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentCoinOrTokenAvailableAmount, currentCoinOrToken.decimals),
    [currentCoinOrToken.decimals, currentCoinOrTokenAvailableAmount],
  );

  const { feeCoins } = useCurrentFeeCoinList(chain);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom)!, [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const currentFeeGasRate = useMemo(() => assetGasRate.data[currentFeeBaseDenom] ?? chain.gasRate, [assetGasRate.data, chain.gasRate, currentFeeBaseDenom]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount);
    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentCoinOrTokenDisplayAvailableAmount;
  }, [currentCoinOrToken, currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount, currentFeeCoin.baseDenom]);

  const currentCoinOrTokenDecimals = currentCoinOrToken.decimals || 0;

  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;

  const currentDisplayMaxDecimals = getDisplayMaxDecimals(currentCoinOrTokenDecimals);

  const errorMessage = useMemo(() => {
    if (!addressRegex.test(currentAddress) || address === currentAddress) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.invalidAddress');
    }

    if (!currentDisplayAmount || !gt(currentDisplayAmount, '0')) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.invalidAmount');
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, plus(currentDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientAmount');
      }
    }

    if ((currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom !== currentFeeCoin.baseDenom) || currentCoinOrToken.type === 'token') {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, currentDisplayAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientFeeAmount');
      }
    }

    return '';
  }, [
    address,
    addressRegex,
    currentAddress,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
  ]);

  const memoizedSendAminoTx = useMemo(() => {
    if (account.data?.value.account_number && addressRegex.test(currentAddress) && currentDisplayAmount) {
      const sequence = String(account.data?.value.sequence || '0');

      if (currentCoinOrToken.type === 'coin') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: chain.type === 'ETHERMINT' ? times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_SEND_GAS, 0) : '1',
              },
            ],
            gas: COSMOS_DEFAULT_SEND_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: chain.chainName === SHENTU.chainName ? 'bank/MsgSend' : 'cosmos-sdk/MsgSend',
              value: {
                from_address: address,
                to_address: currentAddress,
                amount: [{ amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0), denom: currentCoinOrToken.baseDenom }],
              },
            },
          ],
        };
      }

      if (currentCoinOrToken.type === 'token') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_TRANSFER_GAS, 0),
              },
            ],
            gas: COSMOS_DEFAULT_TRANSFER_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: 'wasm/MsgExecuteContract',
              value: {
                sender: address,
                contract: currentCoinOrToken.address,
                msg: {
                  transfer: {
                    recipient: currentAddress,
                    amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                  },
                },
                funds: [],
              },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    address,
    addressRegex,
    chain.chainId,
    chain.chainName,
    chain.type,
    currentAddress,
    currentCoinOrToken,
    currentDisplayAmount,
    currentFeeCoin.baseDenom,
    currentFeeGasRate,
    currentGasRateKey,
    currentMemo,
    nodeInfo.data?.node_info?.network,
  ]);

  const [sendAminoTx] = useDebounce(memoizedSendAminoTx, 1000);

  const sendProtoTx = useMemo(() => {
    if (sendAminoTx) {
      return protoTx(sendAminoTx, Buffer.from(new Uint8Array(64)).toString('base64'), { type: getPublicKeyType(chain), value: '' });
    }
    return null;
  }, [chain, sendAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: sendProtoTx?.tx_bytes });

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, getDefaultAV(chain), 0) : undefined),
    [chain, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(() => customGas || simulatedGas || sendGas, [customGas, sendGas, simulatedGas]);

  useEffect(() => {
    setCurrentFeeAmount(times(currentGas, currentFeeGasRate[currentGasRateKey]));
  }, [currentGas, currentGasRateKey, currentFeeGasRate]);

  return (
    <Container>
      <div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setIsOpenedMyAddressBook(true)} edge="end">
                <AccountAddressIcon />
              </IconButton>
              <IconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                <AddressBook24Icon />
              </IconButton>
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </div>
      <MarginTop8Div>
        <DropdownButton
          imgSrc={currentCoinOrToken.imageURL}
          title={currentCoinOrTokenDisplayDenom}
          leftHeaderTitle={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.available')}
          leftSubTitle={currentCoinOrTokenDisplayAvailableAmount}
          isOpenPopover={isOpenPopover}
          decimals={currentDisplayMaxDecimals}
          onClickDropdown={(currentTarget) => setPopoverAnchorEl(currentTarget)}
        />
      </MarginTop8Div>
      <MarginTop8Div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <MaxButton
                type="button"
                onClick={() => {
                  setCurrentDisplayAmount(maxDisplayAmount);
                }}
              >
                <Typography variant="h7">MAX</Typography>
              </MaxButton>
            </InputAdornment>
          }
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, currentCoinOrToken.decimals || 0) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.amountPlaceholder')}
        />
      </MarginTop8Div>

      <MarginTop16Div>
        <StyledTextarea
          multiline
          minRows={3}
          maxRows={3}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />
      </MarginTop16Div>

      <MarginTop12Div>
        <Fee
          feeCoin={currentFeeCoin}
          feeCoinList={feeCoins}
          gasRate={currentFeeGasRate}
          baseFee={currentFeeAmount}
          gas={currentGas}
          onChangeFeeCoin={(feeCoinBaseDenom) => {
            setCurrentFeeBaseDenom(feeCoinBaseDenom);
          }}
          onChangeGas={(g) => setCustomGas(g)}
          onChangeGasRateKey={(gasRateKey) => setCurrentGasRateKey(gasRateKey)}
          isEdit
        />
      </MarginTop12Div>
      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage || !sendAminoTx}
              onClick={async () => {
                if (sendAminoTx) {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'cos_signAmino',
                      params: {
                        chainName: chain.chainName,
                        doc: { ...sendAminoTx, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas } },
                      },
                    },
                  });
                }

                if (currentAccount.type === 'LEDGER') {
                  await openWindow();
                  window.close();
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.sendButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
          setCurrentMemo(a.memo || '');
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

      <CoinOrTokenPopover
        chain={chain}
        address={address}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={availableCoinOrTokenList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setCurrentDisplayAmount('');
        }}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
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
    </Container>
  );
}
