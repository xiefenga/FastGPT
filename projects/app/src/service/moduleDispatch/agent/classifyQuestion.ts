import { chats2GPTMessages } from '@fastgpt/global/core/chat/adapt';
import { filterGPTMessageByMaxTokens } from '@fastgpt/service/core/chat/utils';
import {
  countGptMessagesTokens,
  countMessagesTokens
} from '@fastgpt/global/common/string/tiktoken';
import type { ChatItemType } from '@fastgpt/global/core/chat/type.d';
import { ChatItemValueTypeEnum, ChatRoleEnum } from '@fastgpt/global/core/chat/constants';
import { getAIApi } from '@fastgpt/service/core/ai/config';
import type { ClassifyQuestionAgentItemType } from '@fastgpt/global/core/module/type.d';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import type { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import { Prompt_CQJson } from '@/global/core/prompt/agent';
import { LLMModelItemType } from '@fastgpt/global/core/ai/model.d';
import { ModelTypeEnum, getLLMModel } from '@fastgpt/service/core/ai/model';
import { getHistories } from '../utils';
import { formatModelChars2Points } from '@fastgpt/service/support/wallet/usage/utils';
import { ChatCompletionRequestMessageRoleEnum } from '@fastgpt/global/core/ai/constants';
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool
} from '@fastgpt/global/core/ai/type';
import { DispatchNodeResultType } from '@fastgpt/global/core/module/runtime/type';
import { chatValue2RuntimePrompt } from '@fastgpt/global/core/chat/adapt';

type Props = ModuleDispatchProps<{
  [ModuleInputKeyEnum.aiModel]: string;
  [ModuleInputKeyEnum.aiSystemPrompt]?: string;
  [ModuleInputKeyEnum.history]?: ChatItemType[] | number;
  [ModuleInputKeyEnum.userChatInput]: string;
  [ModuleInputKeyEnum.agents]: ClassifyQuestionAgentItemType[];
}>;
type CQResponse = DispatchNodeResultType<{
  [key: string]: any;
}>;
type ActionProps = Props & { cqModel: LLMModelItemType };

const agentFunName = 'classify_question';

/* request openai chat */
export const dispatchClassifyQuestion = async (props: Props): Promise<CQResponse> => {
  const {
    user,
    module: { name },
    histories,
    params: { model, history = 6, agents, userChatInput }
  } = props as Props;

  if (!userChatInput) {
    return Promise.reject('Input is empty');
  }

  const cqModel = getLLMModel(model);

  const chatHistories = getHistories(history, histories);

  const { arg, tokens } = await (async () => {
    if (cqModel.toolChoice) {
      return toolChoice({
        ...props,
        histories: chatHistories,
        cqModel
      });
    }
    if (cqModel.functionCall) {
      return functionCall({
        ...props,
        histories: chatHistories,
        cqModel
      });
    }
    return completions({
      ...props,
      histories: chatHistories,
      cqModel
    });
  })();

  const result = agents.find((item) => item.key === arg?.type) || agents[agents.length - 1];

  const { totalPoints, modelName } = formatModelChars2Points({
    model: cqModel.model,
    tokens,
    modelType: ModelTypeEnum.llm
  });

  return {
    [result.key]: true,
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      totalPoints: user.openaiAccount?.key ? 0 : totalPoints,
      model: modelName,
      query: userChatInput,
      tokens,
      cqList: agents,
      cqResult: result.value,
      contextTotalLen: chatHistories.length + 2
    },
    [DispatchNodeResponseKeyEnum.nodeDispatchUsages]: [
      {
        moduleName: name,
        totalPoints: user.openaiAccount?.key ? 0 : totalPoints,
        model: modelName,
        tokens
      }
    ]
  };
};

const getFunctionCallSchema = ({
  cqModel,
  histories,
  params: { agents, systemPrompt, userChatInput }
}: ActionProps) => {
  const messages: ChatItemType[] = [
    ...histories,
    {
      obj: ChatRoleEnum.Human,
      value: [
        {
          type: ChatItemValueTypeEnum.text,
          text: {
            content: systemPrompt
              ? `<背景知识>
    ${systemPrompt}
    </背景知识>

    问题: "${userChatInput}"
          `
              : userChatInput
          }
        }
      ]
    }
  ];

  const adaptMessages = chats2GPTMessages({ messages, reserveId: false });
  const filterMessages = filterGPTMessageByMaxTokens({
    messages: adaptMessages,
    maxTokens: cqModel.maxContext
  });

  // function body
  const agentFunction = {
    name: agentFunName,
    description: '结合对话记录及背景知识，对问题进行分类，并返回对应的类型字段',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: `问题类型。下面是几种可选的问题类型: ${agents
            .map((item) => `${item.value}，返回：'${item.key}'`)
            .join('；')}`,
          enum: agents.map((item) => item.key)
        }
      },
      required: ['type']
    }
  };

  return {
    agentFunction,
    filterMessages
  };
};

const toolChoice = async (props: ActionProps) => {
  const { user, cqModel } = props;

  const { agentFunction, filterMessages } = getFunctionCallSchema(props);
  // function body
  const tools: ChatCompletionTool[] = [
    {
      type: 'function',
      function: agentFunction
    }
  ];

  const ai = getAIApi({
    userKey: user.openaiAccount,
    timeout: 480000
  });

  const response = await ai.chat.completions.create({
    model: cqModel.model,
    temperature: 0,
    messages: filterMessages,
    tools,
    tool_choice: { type: 'function', function: { name: agentFunName } }
  });

  try {
    const arg = JSON.parse(
      response?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || ''
    );
    const completeMessages: ChatCompletionMessageParam[] = [
      ...filterMessages,
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        tool_calls: response.choices?.[0]?.message?.tool_calls
      }
    ];

    return {
      arg,
      tokens: countGptMessagesTokens(completeMessages, tools)
    };
  } catch (error) {
    console.log(response.choices?.[0]?.message);

    console.log('Your model may not support toll_call', error);

    return {
      arg: {},
      tokens: 0
    };
  }
};

const functionCall = async (props: ActionProps) => {
  const { user, cqModel } = props;

  const { agentFunction, filterMessages } = getFunctionCallSchema(props);
  const functions: ChatCompletionCreateParams.Function[] = [agentFunction];

  const ai = getAIApi({
    userKey: user.openaiAccount,
    timeout: 480000
  });

  const response = await ai.chat.completions.create({
    model: cqModel.model,
    temperature: 0,
    messages: filterMessages,
    function_call: {
      name: agentFunName
    },
    functions
  });

  try {
    const arg = JSON.parse(response?.choices?.[0]?.message?.function_call?.arguments || '');
    const completeMessages: ChatCompletionMessageParam[] = [
      ...filterMessages,
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        function_call: response.choices?.[0]?.message?.function_call
      }
    ];

    return {
      arg,
      tokens: countGptMessagesTokens(completeMessages, undefined, functions)
    };
  } catch (error) {
    console.log(response.choices?.[0]?.message);

    console.log('Your model may not support toll_call', error);

    return {
      arg: {},
      tokens: 0
    };
  }
};

const completions = async ({
  cqModel,
  user,
  histories,
  params: { agents, systemPrompt = '', userChatInput }
}: ActionProps) => {
  const messages: ChatItemType[] = [
    {
      obj: ChatRoleEnum.Human,
      value: [
        {
          type: ChatItemValueTypeEnum.text,
          text: {
            content: replaceVariable(cqModel.customCQPrompt || Prompt_CQJson, {
              systemPrompt: systemPrompt || 'null',
              typeList: agents
                .map((item) => `{"questionType": "${item.value}", "typeId": "${item.key}"}`)
                .join('\n'),
              history: histories
                .map((item) => `${item.obj}:${chatValue2RuntimePrompt(item.value).text}`)
                .join('\n'),
              question: userChatInput
            })
          }
        }
      ]
    }
  ];

  const ai = getAIApi({
    userKey: user.openaiAccount,
    timeout: 480000
  });

  const data = await ai.chat.completions.create({
    model: cqModel.model,
    temperature: 0.01,
    messages: chats2GPTMessages({ messages, reserveId: false }),
    stream: false
  });
  const answer = data.choices?.[0].message?.content || '';

  const id =
    agents.find((item) => answer.includes(item.key) || answer.includes(item.value))?.key || '';

  return {
    tokens: countMessagesTokens(messages),
    arg: { type: id }
  };
};
