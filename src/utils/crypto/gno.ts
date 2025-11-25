export function gnoURL(lcdURL: string) {
  return {
    getTxInfo: (txHash: string) => `${lcdURL}/tx?hash=${txHash}`,
  };
}
