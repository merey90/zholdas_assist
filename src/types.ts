export interface ITelegramResponse {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: string;
      is_bot: false;
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
