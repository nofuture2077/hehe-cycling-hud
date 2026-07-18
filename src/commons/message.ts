// ponytail: trimmed duplicate of HeheChat's src/commons/message.tsx — only the chat/system
// message shapes the cycling HUD actually reads (stream-online detection). Full mod-action/event
// message types live in the main repo; this copy can drift, which is the accepted tradeoff of
// not sharing a package across repos.
export type HeheMessage = HeheChatMessage | SystemMessage;

interface UserInfo {
  displayName: string;
  userId: string;
  userName: string;
  color?: string;
  badges: Record<string, string>;
  isMod: boolean;
  isHehePro: boolean;
  isHeheAdmin: boolean;
}

export class HeheChatMessage {
  type: 'chat' = 'chat';
  id: string;
  text: string;
  target: string;
  date: Date;
  userInfo: UserInfo;
  channelId: string;

  constructor(
    id: string,
    text: string,
    target: string,
    date: Date,
    userInfo: UserInfo,
    channelId: string
  ) {
    this.id = id;
    this.text = text;
    this.target = target.startsWith('#') ? target : `#${target}`;
    this.date = date;
    this.userInfo = userInfo;
    this.channelId = channelId;
  }

  static deserialize(json: string): HeheChatMessage {
    const data = JSON.parse(json);
    return new HeheChatMessage(data.id, data.text, data.target, new Date(data.date), data.userInfo, data.channelId);
  }
}

export class SystemMessage {
  type: 'system' = 'system';
  subType: string;
  id: string;
  data: Record<string, unknown>;
  target: string;
  date: Date;

  constructor(subType: string, target: string, data: Record<string, unknown>, date: Date, id: string) {
    this.subType = subType;
    this.target = target;
    this.data = data;
    this.id = id;
    this.date = date;
  }

  static deserialize(json: string): SystemMessage {
    const data = JSON.parse(json);
    return new SystemMessage(data.subType, data.target, data.data, new Date(data.date), data.id);
  }
}

export function parseMessage(rawLine: string): HeheMessage {
  try {
    const data = JSON.parse(rawLine);
    if (data.type === 'system') {
      return SystemMessage.deserialize(rawLine);
    }
    return HeheChatMessage.deserialize(rawLine);
  } catch {
    return HeheChatMessage.deserialize(rawLine);
  }
}

export function isSystemMessageType(msg: HeheMessage) {
  return msg.type === 'system';
}
