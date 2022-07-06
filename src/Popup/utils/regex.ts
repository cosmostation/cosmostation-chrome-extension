export const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const getCosmosAddressRegex = (prefix: string, lengths: number[]) =>
  new RegExp(`^${prefix}(${lengths.map((item) => `(.{${item},${item}})`).join('|')})$`);

export const hexRegex = /^0[x][0-9a-f]+$/;
