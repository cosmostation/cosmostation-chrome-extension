import { useMemo, useState } from 'react';
import { validate } from 'bitcoin-address-validation';
import { networks, payments, Psbt } from 'bitcoinjs-lib';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { P2WPKH__V_BYTES } from '~/constants/bitcoin';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useEstimatesmartfeeSWR } from '~/Popup/hooks/SWR/bitcoin/useEstimatesmartfeeSWR';
import { useUtxoSWR } from '~/Popup/hooks/SWR/bitcoin/useUtxoSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isDecimal, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { ecpairFromPrivateKey } from '~/Popup/utils/crypto';
import type { BitcoinChain } from '~/types/chain';

import Coin from './components/Coin';
import { BottomContainer, Container, Div, MaxButton, StyledInput } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type BitcoinProps = {
  chain: BitcoinChain;
};

export default function Bitcoin({ chain }: BitcoinProps) {
  const { t } = useTranslation();

  const balance = useBalanceSWR(chain, { suspense: true });
  const utxo = useUtxoSWR(chain, { suspense: true });

  const { currentPassword } = useCurrentPassword();

  const { currentAccount } = useCurrentAccount();

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');

  const [currentAddress, setCurrentAddress] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [debouncedCurrentAddress] = useDebounce(currentAddress, 500);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const { decimals } = chain;

  const network = chain.isTestnet ? networks.testnet : networks.bitcoin;

  const estimatesmartfee = useEstimatesmartfeeSWR(chain);

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);

  const p2wpkh = useMemo(() => payments.p2wpkh({ pubkey: keyPair!.publicKey, network }), [keyPair, network]);

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const availableDisplayAmount = useMemo(() => toDisplayDenomAmount(availableAmount, decimals), [availableAmount, decimals]);

  const currentAmount = useMemo(() => Number(toBaseDenomAmount(currentDisplayAmount || '0', decimals)), [currentDisplayAmount, decimals]);

  const fee = useMemo(() => {
    if (!utxo.data?.length) {
      return 0;
    }

    return Math.ceil((utxo.data.length || 0) * P2WPKH__V_BYTES.INPUT + 2 * P2WPKH__V_BYTES.OUTPUT + P2WPKH__V_BYTES.OVERHEAD);
  }, [utxo.data]);

  const change = useMemo(() => availableAmount - currentAmount - fee, [availableAmount, currentAmount, fee]);

  const txHex = useMemo(() => {
    try {
      const psbt = new Psbt({ network });

      const inputs = utxo.data?.map((u) => ({
        hash: u.txid,
        index: u.vout,
        witnessUtxo: {
          script: p2wpkh.output!,
          value: u.value,
        },
      }));

      if (inputs) {
        psbt.addInputs(inputs);
      }

      psbt.addOutputs([
        {
          address: currentAddress,
          value: currentAmount,
        },
        {
          address: p2wpkh.address!,
          value: change,
        },
      ]);

      return psbt.signAllInputs(ecpairFromPrivateKey(keyPair!.privateKey!)).finalizeAllInputs().extractTransaction().toHex();
    } catch {
      return null;
    }
  }, [change, currentAddress, currentAmount, keyPair, network, p2wpkh.address, p2wpkh.output, utxo.data]);

  const handleOnClickMax = () => {
    setCurrentDisplayAmount(toDisplayDenomAmount(availableAmount - fee, chain.decimals));
  };

  const errorMessage = useMemo(() => {
    if (currentAddress !== debouncedCurrentAddress || !validate(debouncedCurrentAddress)) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.invalidAddress');
    }

    if (gasRate === null) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.failedLoadFee');
    }

    if (availableAmount === 0 || availableAmount - Number(toBaseDenomAmount(currentDisplayAmount || '0', decimals)) - fee < 0) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.noAvailableAmount');
    }

    if (!txHex) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.failedCreateTxHex');
    }

    return '';
  }, [availableAmount, currentAddress, currentDisplayAmount, debouncedCurrentAddress, decimals, fee, gasRate, t, txHex]);

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
          placeholder={t('pages.Wallet.Send.Entry.Bitcoin.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </Div>
      <Div sx={{ marginTop: '0.8rem' }}>
        <Coin chain={chain} displayAmount={availableDisplayAmount} />
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
          placeholder={t('pages.Wallet.Send.Entry.Bitcoin.index.amountPlaceholder')}
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
        />
      </Div>

      <Div sx={{ marginTop: '0.8rem' }}>
        <StyledInput
          placeholder={t('pages.Wallet.Send.Entry.Bitcoin.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />
      </Div>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage}
              onClick={() => {
                // console.log('txHex', txHex);
              }}
            >
              {t('pages.Wallet.Send.Entry.Bitcoin.index.sendButton')}
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
  );
}
