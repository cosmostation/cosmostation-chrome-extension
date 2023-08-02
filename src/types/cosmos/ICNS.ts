export type OsmosisICNSResponse = {
  data: {
    bech32_address: string;
  };
};

export type ICNSResponse = {
  data: {
    address: string;
    expiration?: number;
  };
};
