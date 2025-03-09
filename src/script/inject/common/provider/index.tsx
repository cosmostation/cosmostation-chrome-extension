import { commonRequestApp } from '../request';

export class CosmostaionCommon implements CommonProvider {
  private static instance: CosmostaionCommon;

  public static getInstance(): CosmostaionCommon {
    if (!CosmostaionCommon.instance) {
      CosmostaionCommon.instance = new CosmostaionCommon();
    }
    return CosmostaionCommon.instance;
  }

  request = commonRequestApp;
}
