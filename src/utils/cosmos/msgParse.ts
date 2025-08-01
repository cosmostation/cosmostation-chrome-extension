export function getMsgSignData(signer: string, message: string) {
  return {
    account_number: '0',
    chain_id: '',
    fee: {
      amount: [],
      gas: '0',
    },
    memo: '',
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          data: Buffer.from(message, 'utf8').toString('base64'),
          signer,
        },
      },
    ],
    sequence: '0',
  };
}
