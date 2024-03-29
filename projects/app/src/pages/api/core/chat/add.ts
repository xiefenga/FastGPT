import { customAlphabet } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next';

import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';

import { connectToDatabase } from '@/service/mongo';
import { jsonRes } from '@fastgpt/service/common/response';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 12);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { title } = req.body as { title: string };
    const chatId = nanoid();
    const chat = await MongoChat.create({
      title,
      chatId,
      appId: '65f7f94df953769d2f5b79a9',
      userId: '65f7e0dcb1e09c8abcd62570',
      teamId: '65f7e0dcb1e09c8abcd62570',
      tmbId: '65f7e0dcb1e09c8abcd62570',
      source: 'online'
    });
    jsonRes(res, { data: chat });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
