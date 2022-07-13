import { useMemo, useState } from 'react';

import { COSMOS_DEFAULT_GAS } from '~/constants/chain';
import { PUBLIC_KEY_TYPE } from '~/constants/cosmos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import Fee from '~/Popup/components/Fee';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { fix, times } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { signDirect } from '~/Popup/utils/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { decodeProtobufMessage } from '~/Popup/utils/proto';
import { cosmos } from '~/proto/cosmos.js';
import type { CosmosChain, FeeCoin } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { CosSignDirect, CosSignDirectResponse } from '~/types/cosmos/message';
import type { SignDirectDoc } from '~/types/cosmos/proto';

import TxMessage from './components/TxMessage';
import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, FeeContainer, MemoContainer, PaginationContainer, TabContainer } from './styled';
import Memo from '../components/Memo';
import Pagination from '../components/Pagination';
import Tx from '../components/Tx';

type EntryProps = {
  queue: Queue<CosSignDirect>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const [value, setValue] = useState(0);
  const [txMsgPage, setTxMsgPage] = useState(1);
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const assets = useAssetsSWR(chain, { suspense: true });

  const { t } = useTranslation();

  const feeCoins: FeeCoin[] = useMemo(
    () => [
      { originBaseDenom: chain.baseDenom, baseDenom: chain.baseDenom, displayDenom: chain.displayDenom, decimals: chain.decimals },
      ...assets.data.map((asset) => ({ originBaseDenom: asset.base_denom, baseDenom: asset.denom, decimals: asset.decimal, displayDenom: asset.dp_denom })),
    ],
    [assets, chain],
  );

  const { message, messageId, origin } = queue;

  const {
    params: { doc, isEditFee, isEditMemo, gasRate },
  } = message;

  const { auth_info_bytes, body_bytes } = doc;

  const decodedBodyBytes = cosmos.tx.v1beta1.TxBody.decode(body_bytes);
  const decodedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.decode(auth_info_bytes);

  const { fee } = decodedAuthInfoBytes;

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const inputGas = fee?.gas_limit ? String(fee.gas_limit) : COSMOS_DEFAULT_GAS;

  const inputFee = useMemo(() => {
    const foundFee = fee?.amount?.find((item) => item?.denom && item?.amount && feeCoins.map((feeCoin) => feeCoin.baseDenom).includes(item?.denom || ''));

    if (foundFee) return foundFee;

    if (fee?.amount?.[0].amount && fee?.amount?.[0].denom) {
      return fee.amount[0];
    }

    return {
      denom: chain.baseDenom,
      amount: '0',
    };
  }, [chain.baseDenom, fee, feeCoins]);

  const inputFeeAmount = inputFee.amount || '0';

  const selectedFeeCoin = feeCoins.find((feeCoin) => feeCoin.baseDenom === inputFee.denom) || {
    decimals: 0,
    originBaseDenom: inputFee.denom!,
    baseDenom: inputFee.denom!,
    displayDenom: 'UNKNOWN',
  };

  const baseGasRate = gasRate || chain.gasRate;

  const tinyFee = times(inputGas, baseGasRate.tiny);
  const lowFee = times(inputGas, baseGasRate.low);
  const averageFee = times(inputGas, baseGasRate.average);

  const isExistZeroFee = tinyFee === '0' || lowFee === '0' || averageFee === '0';

  const initBaseFee = isEditFee && !isExistZeroFee && inputFeeAmount === '0' ? lowFee : inputFeeAmount;

  const [gas, setGas] = useState(inputGas);
  const [baseFee, setBaseFee] = useState(initBaseFee);
  const [memo, setMemo] = useState(decodedBodyBytes.memo || '');

  const fixedBaseFee = useMemo(() => fix(baseFee, 0, 0), [baseFee]);

  const encodedBodyBytes = cosmos.tx.v1beta1.TxBody.encode({ ...decodedBodyBytes, memo }).finish();
  const encodedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.encode({
    ...decodedAuthInfoBytes,
    fee: { amount: [{ denom: selectedFeeCoin.baseDenom, amount: fixedBaseFee }], gas_limit: Number(gas) },
  }).finish();

  const bodyBytes = isEditMemo ? encodedBodyBytes : doc.body_bytes;
  const authInfoBytes = isEditFee ? encodedAuthInfoBytes : doc.auth_info_bytes;

  const decodedChangedBodyBytes = cosmos.tx.v1beta1.TxBody.decode(bodyBytes);
  const decodedChangedAuthInfoBytes = cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes);

  const { messages } = decodedChangedBodyBytes;
  const msgs = messages.map((item) => decodeProtobufMessage(item));

  const tx = {
    ...doc,
    body_bytes: { ...decodedChangedBodyBytes, messages: msgs },
    auth_info_bytes: decodedChangedAuthInfoBytes,
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <PopupHeader
        account={{ id: currentAccount.id, name: currentAccount.name, address }}
        chain={{ name: chain.chainName, imageURL: chain.imageURL }}
        origin={origin}
      />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.Direct.entry.dataTab')} />
          </Tabs>
        </TabContainer>
        <TabPanel value={value} index={0}>
          <TxMessage msg={msgs[txMsgPage - 1]} chain={chain} />
          {msgs.length > 1 && (
            <PaginationContainer>
              <Pagination currentPage={txMsgPage} totalPage={msgs.length} onChange={(page) => setTxMsgPage(page)} />
            </PaginationContainer>
          )}
          <MemoContainer>
            <Memo memo={memo} onChange={(m) => setMemo(m)} isEdit={isEditMemo} />
          </MemoContainer>

          {fee && (
            <FeeContainer>
              <Fee
                feeCoin={selectedFeeCoin}
                gasRate={gasRate || chain.gasRate}
                baseFee={baseFee}
                gas={gas}
                onChangeFee={(f) => setBaseFee(f)}
                onChangeGas={(g) => setGas(g)}
                isEdit={isEditFee}
              />
            </FeeContainer>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Tx tx={tx} />
        </TabPanel>
      </ContentsContainer>
      <BottomContainer>
        <BottomButtonContainer>
          <OutlineButton
            onClick={async () => {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.USER_REJECTED_REQUEST,
                    message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                  },
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Direct.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              const signedDoc = { ...doc, body_bytes: bodyBytes, auth_info_bytes: authInfoBytes };

              const signature = signDirect(signedDoc, keyPair!.privateKey, chain);

              const base64Signature = Buffer.from(signature).toString('base64');

              const base64PublicKey = Buffer.from(keyPair!.publicKey).toString('base64');

              const publicKeyType = PUBLIC_KEY_TYPE.SECP256K1;

              const signedDocHex = { ...doc, body_bytes: Buffer.from(bodyBytes).toString('hex'), auth_info_bytes: Buffer.from(authInfoBytes).toString('hex') };
              const pubKey = { type: publicKeyType, value: base64PublicKey };

              const result: CosSignDirectResponse = {
                signature: base64Signature,
                pub_key: pubKey,
                signed_doc: signedDocHex as unknown as SignDirectDoc,
              };

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Direct.entry.confirmButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
