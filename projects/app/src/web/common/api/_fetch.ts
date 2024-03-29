import { EventStreamContentType, fetchEventSource } from '@fortaine/fetch-event-source';

import { getErrText } from '@fastgpt/global/common/error/utils';
import { ChatHistoryItemResType } from '@fastgpt/global/core/chat/type';
import {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@fastgpt/global/core/module/runtime/constants';

import { getToken } from '@/web/support/user/auth';
import type { StartChatFnProps } from '@/components/ChatBox/type';

type StreamFetchProps = {
  url?: string;
  data: Record<string, any>;
  onMessage: StartChatFnProps['generatingMessage'];
  abortCtrl: AbortController;
};
type StreamResponseType = {
  responseText: string;
  [DispatchNodeResponseKeyEnum.nodeResponse]: ChatHistoryItemResType[];
};

// TODO: transform to async generator
export const streamFetch = ({
  url = '/sophonsai/chat/chat',
  data,
  onMessage,
  abortCtrl
}: StreamFetchProps) => {
  return new Promise<StreamResponseType>(async (resolve, reject) => {
    const timeoutId = setTimeout(() => abortCtrl.abort('Time out'), 60000);

    let errMsg = '';
    let finished = false;
    let responseText = '';
    let responseData: ChatHistoryItemResType[] = [];

    const finish = () => {
      if (errMsg) {
        return failedFinish();
      }
      return resolve({
        responseText,
        responseData
      });
    };

    const failedFinish = (err?: any) => {
      finished = true;
      reject({
        message: getErrText(err, errMsg || '响应过程出现异常~'),
        responseText
      });
    };

    let remainTextList: { event: `${SseResponseEventEnum}`; text: string }[] = [];

    function animateResponseText() {
      // abort message
      if (abortCtrl.signal.aborted) {
        remainTextList.forEach((item) => {
          onMessage(item);
          if (item.event === SseResponseEventEnum.answer) {
            responseText += item.text;
          }
        });
        return finish();
      }
      if (remainTextList.length > 0) {
        const fetchCount = Math.max(1, Math.round(remainTextList.length / 60));

        for (let i = 0; i < fetchCount; i++) {
          const item = remainTextList[i];
          onMessage(item);
          if (item.event === SseResponseEventEnum.answer) {
            responseText += item.text;
          }
        }

        remainTextList = remainTextList.slice(fetchCount);
      }

      if (finished && remainTextList.length === 0) {
        return finish();
      }

      requestAnimationFrame(animateResponseText);
    }

    try {
      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Access-Token': getToken(),
          'Content-Type': 'application/json'
        },
        signal: abortCtrl.signal,
        body: JSON.stringify({ ...data, stream: true }),
        async onopen(res) {
          clearTimeout(timeoutId);
          const contentType = res.headers.get('content-type');

          // not stream
          if (contentType?.startsWith('text/plain')) {
            return failedFinish(await res.clone().text());
          }

          // failed stream
          if (!res.ok || !contentType?.startsWith(EventStreamContentType) || res.status !== 200) {
            try {
              failedFinish(await res.clone().json());
            } catch {
              const errText = await res.clone().text();
              if (!errText.startsWith('event: error')) {
                failedFinish();
              }
            }
          } else {
            // start animation
            animateResponseText();
          }
        },
        onclose() {
          finished = true;
        },
        onerror(e) {
          clearTimeout(timeoutId);
          failedFinish(getErrText(e));
        },
        onmessage({ data }) {
          // parse text to json
          const parseJson = (() => {
            try {
              return JSON.parse(data);
            } catch (error) {
              return {};
            }
          })();
          console.log(parseJson);
          remainTextList.push({
            event: SseResponseEventEnum.answer,
            text: parseJson.text
          });
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (abortCtrl.signal.aborted) {
        finished = true;

        return;
      }
      console.log(error, 'fetch error');

      failedFinish(error);
    }
  });
};

export const fetchStream = async (props: StreamFetchProps) => {
  const { url, data, onMessage, abortCtrl } = props;
  // try {
  //   return await streamFetch({ url, data, onMessage, abortCtrl })
  // } catch (error) {
  //   console.log(error, 'fetchStream error')
  //   throw error
  // }
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {}
      };
    }
  };
};
