export interface AdDataV1 {
  version: 1;
  ads: AdV1[];
}

export interface AdV1 {
  id: string;
  priority: number;
  title: string;
  startAt?: string | null;
  endAt?: string | null;
  images?: Images;
  linkUrl?: string;
  view_detail?: string;
  color?: string;
}

export interface Images {
  extension?: string;
  mobile?: string;
}
