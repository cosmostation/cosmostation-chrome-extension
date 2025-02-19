export type BlockLatestResponse = {
  block: {
    header: {
      chain_id: string;
      height: string;
      time: string;
    };
  };
};
