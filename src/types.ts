export interface ITelegramResponse {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: string;
      is_bot: boolean;
      first_name: string;
      username: string;
      language_code: string;
    };
    chat: {
      id: string;
      first_name: string;
      title: string;
      type: string;
    };
    date: number;
    text: string;
    entities: [
      {
        offset: number;
        length: number;
        type: string;
      }
    ];
  };
}

export interface IHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name: string;
}

export interface IMongoMessage extends IHistoryItem {
  userId: string;
  chatId: string;
}

export interface IOpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      message: IHistoryItem;
      finish_reason: string;
      index: number;
    }
  ];
}
