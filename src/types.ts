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
      username: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface IUserHistory {
  [key: string]: IHistoryItem[];
}

export interface IChatHistory {
  [key: string]: IUserHistory;
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
