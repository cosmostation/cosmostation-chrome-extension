import { useMemo, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';
import Number from '~/Popup/components/common/Number';
import Fee from '~/Popup/components/Fee';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/tendermint/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/tendermint/useAmountSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { TendermintChain } from '~/types/chain';

import {
  AvailableContainer,
  BottomContainer,
  Container,
  DisplayDenomContainer,
  MarginTop8Div,
  MarginTop12Div,
  MarginTop16Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
} from './styled';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type TendermintProps = {
  chain: TendermintChain;
};

export default function Tendermint({ chain }: TendermintProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable } = useAmountSWR(chain, true);
  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { enQueue } = useCurrentQueue();

  const { decimals, gas, gasRate } = chain;

  const sendGas = gas.send || '80000';

  const [currentGas, setCurrentGas] = useState(sendGas);
  const [currentFee, setCurrentFee] = useState(times(sendGas, gasRate.low));
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const displayAvailable = toDisplayDenomAmount(vestingRelatedAvailable, decimals);

  const DisplayFee = toDisplayDenomAmount(currentFee, decimals);

  const maxDisplayAmount = minus(displayAvailable, DisplayFee);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);

  const addressRegex = useMemo(() => new RegExp(`^${chain.bech32Prefix.address}(.{39,39})$`), [chain.bech32Prefix.address]);

  const isPossibleSend = useMemo(
    () =>
      currentDisplayAmount &&
      gte(displayAvailable, plus(currentDisplayAmount, DisplayFee)) &&
      !!currentAddress &&
      address !== currentAddress &&
      addressRegex.test(currentAddress),
    [DisplayFee, address, addressRegex, currentAddress, currentDisplayAmount, displayAvailable],
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
          placeholder="Address"
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </div>
      <MarginTop8Div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <DisplayDenomContainer>
                <Typography variant="h6">{chain.displayDenom.toUpperCase()}</Typography>
              </DisplayDenomContainer>
              <MaxButton
                type="button"
                onClick={() => {
                  if (gt(maxDisplayAmount, '0')) {
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
            if (!isDecimal(e.currentTarget.value, decimals) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
          placeholder="Amount"
        />
      </MarginTop8Div>

      <AvailableContainer>
        <Typography variant="h6n">Available :&nbsp;</Typography>
        <Number typoOfIntegers="h6n" typoOfDecimals="h8n">
          {displayAvailable}
        </Number>

        <Typography variant="h6n">&nbsp;{chain.displayDenom.toUpperCase()}</Typography>
      </AvailableContainer>

      <MarginTop16Div>
        <StyledTextarea multiline minRows={3} maxRows={3} placeholder="Memo" onChange={(e) => setCurrentMemo(e.currentTarget.value)} value={currentMemo} />
      </MarginTop16Div>

      <MarginTop12Div>
        <Fee chain={chain} baseFee={currentFee} gas={currentGas} onChangeGas={(g) => setCurrentGas(g)} onChangeFee={(f) => setCurrentFee(f)} isEdit />
      </MarginTop12Div>
      <BottomContainer>
        <Button
          type="button"
          disabled={!isPossibleSend}
          onClick={async () => {
            await enQueue({
              messageId: '',
              origin: '',
              channel: 'ten_send',
              message: {
                method: 'ten_signAmino',
                params: {
                  chainName: chain.chainName,
                  doc: {
                    account_number: account.data.value.account_number,
                    sequence: account.data.value.sequence || '0',
                    chain_id: chain.chainId,
                    fee: { amount: [{ denom: chain.baseDenom, amount: currentFee }], gas: currentGas },
                    memo: currentMemo,
                    msgs: [
                      {
                        type: chain.chainName === 'certik' ? 'bank/MsgSend' : 'cosmos-sdk/MsgSend',
                        value: {
                          from_address: address,
                          to_address: currentAddress,
                          amount: [{ amount: toBaseDenomAmount(currentDisplayAmount, decimals), denom: chain.baseDenom }],
                        },
                      },
                    ],
                  },
                },
              },
            });
          }}
        >
          Send
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
    </Container>
  );
}
