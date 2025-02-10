export enum MessageType {
    CHAT = 'CHAT',
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    FILE = 'FILE',
    IMAGE = 'IMAGE'
}

export interface ChatMessage {
    type: MessageType;
    content?: string;
    sender: string;
    fileName?: string;
    fileType?: string;
    fileContent?: string;
    timestamp: string;
}

export interface User {
    username: string;
}
