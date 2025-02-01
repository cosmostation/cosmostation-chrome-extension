import type { MessageBase, TargetType } from '@/types/message';

import type { Request, Response } from './inject';

// CONTENT MESSAGES
export interface ResponseAppMessage<T extends Request> extends MessageBase {
  target: Extract<TargetType, 'CONTENT'>;
  method: 'responseApp';
  params: Response<T>;
  requestId: string;
  tabId?: number;
  origin: string;
}

export interface SidePanelOpenMessage extends MessageBase {
  target: Extract<TargetType, 'CONTENT'>;
  method: 'openSidePanel';
  requestId: string;
  tabId?: number;
  origin: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentMessage = ResponseAppMessage<any> | SidePanelOpenMessage;

export interface ContentResponse {
  responseApp: null;
}
