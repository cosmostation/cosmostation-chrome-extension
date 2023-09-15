export const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const aptosAddressRegex = /^0x([a-fA-F0-9]{64}|[a-fA-F1-9]{1}[a-fA-F0-9]{62})$/;

export const suiAddressRegex = /^0x([a-fA-F0-9]{64}|[a-fA-F1-9]{1}[a-fA-F0-9]{62})$/;

export const getCosmosAddressRegex = (prefix: string, lengths: number[]) =>
  new RegExp(`^${prefix}(${lengths.map((item) => `(.{${item},${item}})`).join('|')})$`);

export const hexRegex = /^0[x][0-9a-f]+$/;
export const hexOrDecRegex = /^(0[x][0-9a-f]+|[0-9]+)$/;

export const httpsRegex = /^https:\/\/[\w-]+(\.[\w-]+)*(:\d+)?(\/\S*)?$/;

export const isNaturalNumberRegex = /^\d+$/;
