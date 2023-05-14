import { IHistoryItem, IMongoMessage } from './types';

declare const MONGO_API_KEY: string;
const baseUrl =
  'https://eu-central-1.aws.data.mongodb-api.com/app/data-ngooe/endpoint/data/v1/action/';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Request-Headers': '*',
  'api-key': MONGO_API_KEY,
};
const baseBody = {
  collection: 'userChats',
  database: 'zholdas_assist',
  dataSource: 'zholdas-assist',
};

export async function fetchUserMessages(
  userId: string,
  chatId: string
): Promise<IMongoMessage[]> {
  const body = JSON.stringify({
    ...baseBody,
    filter: {
      userId,
      chatId,
    },
  });

  const response = await fetch(`${baseUrl}find`, {
    method: 'POST',
    headers,
    body,
  });

  const { documents } = await response.json<{ documents: IMongoMessage[] }>();
  return documents;
}

export async function deleteUserMessages(
  userId: string,
  chatId: string
): Promise<IMongoMessage[]> {
  const body = JSON.stringify({
    ...baseBody,
    filter: {
      userId,
      chatId,
    },
  });

  const response = await fetch(`${baseUrl}deleteMany`, {
    method: 'POST',
    headers,
    body,
  });

  //{"deletedCount":3}
  return response.json();
}

export async function addMessage(
  userId: string,
  chatId: string,
  message: IHistoryItem
): Promise<IMongoMessage[]> {
  const body = JSON.stringify({
    ...baseBody,
    document: {
      userId,
      chatId,
      ...message,
    },
  });

  const response = await fetch(`${baseUrl}insertOne`, {
    method: 'POST',
    headers,
    body,
  });
  //  {"insertedId":"someId"}
  return response.json();
}
