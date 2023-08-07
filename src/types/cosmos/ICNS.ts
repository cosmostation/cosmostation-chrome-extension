export type ICNSResponse = {
  data: {
    bech32_address: string;
  };
};

export type ArchIDResponse = {
  data: {
    address: string;
    expiration?: number;
  };
};
