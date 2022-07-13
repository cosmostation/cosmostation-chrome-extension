import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_DEFAULT_GAS } from '~/constants/chain';
import { CERTIK } from '~/constants/chain/cosmos/certik';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import type { CoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';

import CoinPopover from './components/CoinPopover';
import {
  BottomContainer,
  CoinButton,
  CoinLeftAvailableContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightContainer,
  Container,
  MarginTop8Div,
  MarginTop12Div,
  MarginTop16Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
} from './styled';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const { t } = useTranslation();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gas, gasRate } = chain;

  const sendGas = gas.send || COSMOS_DEFAULT_GAS;

  const filteredCoinList = [...coinList.coins, ...coinList.ibcCoins].filter((item) => gt(item.availableAmount, '0'));

  const availableCoinList: CoinInfo[] = [
    {
      availableAmount: vestingRelatedAvailable,
      totalAmount,
      decimals: chain.decimals,
      imageURL: chain.imageURL,
      displayDenom: chain.displayDenom,
      baseDenom: chain.baseDenom,
    },
    ...filteredCoinList,
  ];

  const [currentCoinBaseDenom, setCurrentCoinBaseDenom] = useState(params.coin || chain.baseDenom);

  const [currentGas, setCurrentGas] = useState(sendGas);
  const [currentFee, setCurrentFee] = useState(times(sendGas, gasRate.low));
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const displayAvailable = toDisplayDenomAmount(vestingRelatedAvailable, decimals);

  const DisplayFee = toDisplayDenomAmount(currentFee, decimals);

  const maxDisplayAmount = minus(displayAvailable, DisplayFee);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39]), [chain]);

  const currentCoin = availableCoinList.find((item) => item.baseDenom === currentCoinBaseDenom)!;

  const currentDecimals = currentCoin.decimals || 0;

  const currentCoinDisplayDenom = currentCoin.displayDenom;
  const currentCoinDisplayAmount = toDisplayDenomAmount(currentCoin.availableAmount, currentDecimals);

  const currentDisplayMaxDecimals = getDisplayMaxDecimals(currentDecimals);

  const isPossibleSend = useMemo(
    () =>
      ((chain.baseDenom === currentCoin.baseDenom &&
        currentDisplayAmount &&
        gte(displayAvailable, plus(currentDisplayAmount, DisplayFee)) &&
        !!currentAddress &&
        address !== currentAddress) ||
        (chain.baseDenom !== currentCoin.baseDenom &&
          currentDisplayAmount &&
          gte(displayAvailable, DisplayFee) &&
          gte(currentCoinDisplayAmount, currentDisplayAmount))) &&
      gt(currentDisplayAmount, '0') &&
      addressRegex.test(currentAddress) &&
      address !== currentAddress,
    [
      DisplayFee,
      address,
      addressRegex,
      currentAddress,
      currentDisplayAmount,
      currentCoinDisplayAmount,
      displayAvailable,
      chain.baseDenom,
      currentCoin.baseDenom,
    ],
  );

  return (
    <Container>
      <div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                <AddressBook24Icon />
              </IconButton>
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </div>
      <MarginTop8Div>
        <CoinButton
          type="button"
          onClick={(event) => {
            setPopoverAnchorEl(event.currentTarget);
          }}
        >
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image src={currentCoin.imageURL} />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">{currentCoinDisplayDenom}</Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.index.available')} :</Typography>{' '}
                <Tooltip title={currentCoinDisplayAmount} arrow placement="top">
                  <span>
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={currentDisplayMaxDecimals}>
                      {currentCoinDisplayAmount}
                    </Number>
                  </span>
                </Tooltip>
              </CoinLeftAvailableContainer>
            </CoinLeftInfoContainer>
          </CoinLeftContainer>
          <CoinRightContainer data-is-active={isOpenPopover ? 1 : 0}>
            <BottomArrow24Icon />
          </CoinRightContainer>
        </CoinButton>
      </MarginTop8Div>
      <MarginTop8Div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <MaxButton
                type="button"
                onClick={() => {
                  if (chain.baseDenom !== currentCoin.baseDenom) {
                    setCurrentDisplayAmount(currentCoinDisplayAmount);
                  } else if (chain.baseDenom === currentCoin.baseDenom && gt(maxDisplayAmount, '0')) {
                    setCurrentDisplayAmount(maxDisplayAmount);
                  } else {
                    setCurrentDisplayAmount('0');
                  }
                }}
              >
                <Typography variant="h7">MAX</Typography>
              </MaxButton>
            </InputAdornment>
          }
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, currentCoin.decimals || 0) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.amountPlaceholder')}
        />
      </MarginTop8Div>

      <MarginTop16Div>
        <StyledTextarea
          multiline
          minRows={3}
          maxRows={3}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />
      </MarginTop16Div>

      <MarginTop12Div>
        <Fee
          feeCoin={{ ...chain, originBaseDenom: chain.baseDenom }}
          gasRate={chain.gasRate}
          baseFee={currentFee}
          gas={currentGas}
          onChangeGas={(g) => setCurrentGas(g)}
          onChangeFee={(f) => setCurrentFee(f)}
          isEdit
        />
      </MarginTop12Div>
      <BottomContainer>
        <Button
          type="button"
          disabled={!isPossibleSend}
          onClick={async () => {
            await enQueue({
              messageId: '',
              origin: '',
              channel: 'inApp',
              message: {
                method: 'cos_signAmino',
                params: {
                  chainName: chain.chainName,
                  doc: {
                    account_number: String(account.data?.value.account_number ?? ''),
                    sequence: String(account.data?.value.sequence ?? '0'),
                    chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
                    fee: { amount: [{ denom: chain.baseDenom, amount: currentFee }], gas: currentGas },
                    memo: currentMemo,
                    msgs: [
                      {
                        type: chain.chainName === CERTIK.chainName ? 'bank/MsgSend' : 'cosmos-sdk/MsgSend',
                        value: {
                          from_address: address,
                          to_address: currentAddress,
                          amount: [{ amount: toBaseDenomAmount(currentDisplayAmount, currentCoin.decimals || 0), denom: currentCoin.baseDenom }],
                        },
                      },
                    ],
                  },
                },
              },
            });
          }}
        >
          {t('pages.Wallet.Send.Entry.Cosmos.index.sendButton')}
        </Button>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />

      <CoinPopover
        marginThreshold={0}
        currentCoinInfo={currentCoin}
        coinInfos={availableCoinList}
        onClickCoin={(clickedCoin) => {
          setCurrentCoinBaseDenom(clickedCoin.baseDenom);
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
