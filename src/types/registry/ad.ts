export interface AdDataV1 {
  version: 1;
  ads: AdV1[];
}

export interface AdV1 {
  id: string;
  priority: number;
  title: string;
  startAt?: string;
  endAt?: string;
  images?: Images;
  linkUrl?: string;
}

export interface Images {
  extension?: string;
  mobile?: string;
}
