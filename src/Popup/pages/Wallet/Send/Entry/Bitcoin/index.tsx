import { useMemo, useState } from 'react';
import { validate } from 'bitcoin-address-validation';
import { networks, payments, Psbt } from 'bitcoinjs-lib';
import { isTaprootInput, toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { P2WPKH__V_BYTES } from '~/constants/bitcoin';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import NumberComponent from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useEstimatesmartfeeSWR } from '~/Popup/hooks/SWR/bitcoin/useEstimatesmartfeeSWR';
import { useUtxoSWR } from '~/Popup/hooks/SWR/bitcoin/useUtxoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { post } from '~/Popup/utils/axios';
import { isDecimal, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddressType, initBitcoinEcc } from '~/Popup/utils/bitcoin';
import { getKeyPair } from '~/Popup/utils/common';
import { ecpairFromPrivateKey, getTweakSigner } from '~/Popup/utils/crypto';
import type { SendRawTransaction } from '~/types/bitcoin/transaction';
import type { BitcoinChain } from '~/types/chain';

import Coin from './components/Coin';
import ConfirmDialog from './components/ConfirmDialog';
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
  MaxButton,
  StyledInput,
} from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';

type BitcoinProps = {
  chain: BitcoinChain;
};

export default function Bitcoin({ chain }: BitcoinProps) {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const { navigate } = useNavigate();

  const balance = useBalanceSWR(chain, { suspense: true });
  const utxo = useUtxoSWR(chain, { suspense: true });

  const [isOpenedConfirmDialog, setIsOpenedConfirmDialog] = useState(false);

  const { extensionStorage } = useExtensionStorage();

  const { data } = useCoinGeckoPriceSWR();

  const { currentPassword } = useCurrentPassword();

  const { currentAccount } = useCurrentAccount();

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');

  const [currentAddress, setCurrentAddress] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const coinGeckoId = useMemo(() => chain.coinGeckoId, [chain.coinGeckoId]);

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [extensionStorage.currency, coinGeckoId, data]);

  const { decimals } = chain;

  const network = useMemo(() => (chain.isTestnet || chain.isSignet ? networks.testnet : networks.bitcoin), [chain.isSignet, chain.isTestnet]);

  const estimatesmartfee = useEstimatesmartfeeSWR(chain);

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);

  const addressType = useMemo(() => getAddressType(chain), [chain]);

  const payment = useMemo(() => {
    try {
      if (!keyPair) {
        return undefined;
      }

      initBitcoinEcc();

      if (addressType === 'p2wpkh') {
        return payments.p2wpkh({ pubkey: keyPair.publicKey, network });
      }

      if (addressType === 'p2tr') {
        const tapInternalKey = toXOnly(keyPair.publicKey);

        return payments.p2tr({
          internalPubkey: tapInternalKey,
          network,
        });
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, [addressType, keyPair, network]);

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const availableDisplayAmount = useMemo(() => toDisplayDenomAmount(availableAmount, decimals), [availableAmount, decimals]);

  const currentAmount = useMemo(() => Number(toBaseDenomAmount(currentDisplayAmount || '0', decimals)), [currentDisplayAmount, decimals]);

  const currentMemoBytes = useMemo(() => Buffer.from(currentMemo, 'utf8').length, [currentMemo]);

  const currentVbytes = useMemo(() => {
    if (!utxo.data?.length) {
      return 0;
    }

    const isMemo = currentMemoBytes > 0;

    return (utxo.data.length || 0) * P2WPKH__V_BYTES.INPUT + 2 * P2WPKH__V_BYTES.OUTPUT + P2WPKH__V_BYTES.OVERHEAD + (isMemo ? 3 : 0) + currentMemoBytes;
  }, [currentMemoBytes, utxo.data]);

  const fee = useMemo(() => {
    if (!gasRate) {
      return 0;
    }

    return Math.ceil(currentVbytes * gasRate * 100000);
  }, [gasRate, currentVbytes]);

  const displayFee = useMemo(() => toDisplayDenomAmount(fee, decimals), [fee, decimals]);

  const change = useMemo(() => availableAmount - currentAmount - fee, [availableAmount, currentAmount, fee]);

  const displayFeePrice = useMemo(() => times(displayFee, price), [displayFee, price]);

  const currentInputs = useMemo(() => {
    if (!payment) return undefined;

    if (addressType === 'p2tr') {
      return utxo.data?.map((u) => ({
        hash: u.txid,
        index: u.vout,
        witnessUtxo: {
          script: payment.output!,
          value: u.value,
        },
        tapInternalKey: payment.internalPubkey,
      }));
    }

    return utxo.data?.map((u) => ({
      hash: u.txid,
      index: u.vout,
      witnessUtxo: {
        script: payment.output!,
        value: u.value,
      },
    }));
  }, [addressType, payment, utxo.data]);

  const currentOutputs = useMemo(
    () => [
      {
        address: currentAddress,
        value: currentAmount,
      },
      {
        address: payment?.address || '',
        value: change,
      },
    ],
    [change, currentAddress, currentAmount, payment?.address],
  );

  const txHex = useMemo(() => {
    try {
      initBitcoinEcc();
      const psbt = new Psbt({ network });

      if (currentInputs) {
        psbt.addInputs(currentInputs);
      }

      psbt.addOutputs(currentOutputs);

      if (currentMemoBytes > 0) {
        const memo = Buffer.from(currentMemo, 'utf8');
        psbt.addOutput({ script: payments.embed({ data: [memo] }).output!, value: 0 });
      }

      const tweakSigner = getTweakSigner(currentAccount, chain, currentPassword, {
        tweakHash: null,
        network: chain.isSignet ? 'testnet' : 'mainnet',
      });

      const signer = ecpairFromPrivateKey(keyPair!.privateKey!);

      psbt.data.inputs.forEach((input, index) => {
        if (isTaprootInput(input)) {
          psbt.signInput(index, tweakSigner!);
        } else {
          psbt.signInput(index, signer);
        }
      });

      return psbt.finalizeAllInputs().extractTransaction().toHex();
    } catch {
      return null;
    }
  }, [chain, currentAccount, currentInputs, currentMemo, currentMemoBytes, currentOutputs, currentPassword, keyPair, network]);

  const handleOnClickMax = () => {
    setCurrentDisplayAmount(toDisplayDenomAmount(availableAmount - fee, chain.decimals));
  };

  const errorMessage = useMemo(() => {
    if (!validate(currentAddress)) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.invalidAddress');
    }

    if (gasRate === null) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.failedLoadFee');
    }

    if (availableAmount === 0 || availableAmount - currentAmount - fee < 0) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.noAvailableAmount');
    }

    if (!currentAmount) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.noAmount');
    }

    if (!txHex) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.failedCreateTxHex');
    }

    if (currentMemoBytes > 80) {
      return t('pages.Wallet.Send.Entry.Bitcoin.index.memoMaxLength');
    }

    return '';
  }, [availableAmount, currentAmount, currentMemoBytes, currentAddress, fee, gasRate, t, txHex]);

  const onClickSend = async () => {
    try {
      const response = await post<SendRawTransaction>(
        chain.rpcURL,
        {
          jsonrpc: '2.0',
          id: '1',
          method: 'sendrawtransaction',
          params: [txHex],
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (response.error) {
        enqueueSnackbar(response.error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(t('pages.Wallet.Send.Entry.Bitcoin.index.successSend'), { variant: 'success' });
        navigate('/');
      }

      setIsOpenedConfirmDialog(false);
    } catch (e) {
      enqueueSnackbar(t('pages.Wallet.Send.Entry.Bitcoin.index.failureSend'), { variant: 'error' });
    }
  };

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
          onChange={(e) => {
            const { value } = e.currentTarget;
            if (Buffer.from(value, 'utf-8').length > 80) {
              return;
            }

            setCurrentMemo(e.currentTarget.value);
          }}
          value={currentMemo}
        />
      </Div>

      <FeeContainer>
        <FeeInfoContainer>
          <FeeLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.Send.Entry.Bitcoin.index.fee')}</Typography>
          </FeeLeftContainer>
          <FeeRightContainer>
            <FeeRightColumnContainer>
              <FeeRightAmountContainer>
                <NumberComponent typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayFee}
                </NumberComponent>
                &nbsp;
                <Typography variant="h5n">{chain.displayDenom}</Typography>
              </FeeRightAmountContainer>
              <FeeRightValueContainer>
                <NumberComponent typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
                  {displayFeePrice}
                </NumberComponent>
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
              onClick={() => {
                setIsOpenedConfirmDialog(true);
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

      <ConfirmDialog open={isOpenedConfirmDialog} onClickSend={onClickSend} onClose={() => setIsOpenedConfirmDialog(false)} />
    </Container>
  );
}
