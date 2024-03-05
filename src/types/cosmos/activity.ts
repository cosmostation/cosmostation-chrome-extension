export type Activity = {
  header?: {
    id?: string;
    chain_id?: string;
    timestamp?: string;
  };
  data?: {
    height?: string;
    txhash?: string;
    codespace?: string;
    code?: number;
    info?: string;
    timestamp?: string;
    tx?: JSON;
    logs?: JSON[];
  };
  search_after?: string;
};

export type ActivitiesResponse = Activity[];
