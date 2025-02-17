import { chats2GPTMessages } from '@fastgpt/global/core/chat/adapt';
import { filterGPTMessageByMaxTokens } from '@fastgpt/service/core/chat/utils';
import type { ChatItemType } from '@fastgpt/global/core/chat/type.d';
import {
  countGptMessagesTokens,
  countMessagesTokens
} from '@fastgpt/global/common/string/tiktoken';
import { ChatItemValueTypeEnum, ChatRoleEnum } from '@fastgpt/global/core/chat/constants';
import { getAIApi } from '@fastgpt/service/core/ai/config';
import type { ContextExtractAgentItemType } from '@fastgpt/global/core/module/type';
import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import type { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import { Prompt_ExtractJson } from '@/global/core/prompt/agent';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import { LLMModelItemType } from '@fastgpt/global/core/ai/model.d';
import { getHistories } from '../utils';
import { ModelTypeEnum, getLLMModel } from '@fastgpt/service/core/ai/model';
import { formatModelChars2Points } from '@fastgpt/service/support/wallet/usage/utils';
import json5 from 'json5';
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool
} from '@fastgpt/global/core/ai/type';
import { ChatCompletionRequestMessageRoleEnum } from '@fastgpt/global/core/ai/constants';
import { DispatchNodeResultType } from '@fastgpt/global/core/module/runtime/type';
import { chatValue2RuntimePrompt } from '@fastgpt/global/core/chat/adapt';

type Props = ModuleDispatchProps<{
  [ModuleInputKeyEnum.history]?: ChatItemType[];
  [ModuleInputKeyEnum.contextExtractInput]: string;
  [ModuleInputKeyEnum.extractKeys]: ContextExtractAgentItemType[];
  [ModuleInputKeyEnum.description]: string;
  [ModuleInputKeyEnum.aiModel]: string;
}>;
type Response = DispatchNodeResultType<{
  [ModuleOutputKeyEnum.success]?: boolean;
  [ModuleOutputKeyEnum.failed]?: boolean;
  [ModuleOutputKeyEnum.contextExtractFields]: string;
}>;

type ActionProps = Props & { extractModel: LLMModelItemType };

const agentFunName = 'extract_json_data';

export async function dispatchContentExtract(props: Props): Promise<Response> {
  const {
    user,
    module: { name },
    histories,
    params: { content, history = 6, model, description, extractKeys }
  } = props;

  if (!content) {
    return Promise.reject('Input is empty');
  }

  const extractModel = getLLMModel(model);
  const chatHistories = getHistories(history, histories);

  const { arg, tokens } = await (async () => {
    if (extractModel.toolChoice) {
      return toolChoice({
        ...props,
        histories: chatHistories,
        extractModel
      });
    }
    if (extractModel.functionCall) {
      return functionCall({
        ...props,
        histories: chatHistories,
        extractModel
      });
    }
    return completions({
      ...props,
      histories: chatHistories,
      extractModel
    });
  })();

  // remove invalid key
  for (let key in arg) {
    const item = extractKeys.find((item) => item.key === key);
    if (!item) {
      delete arg[key];
    }
    if (arg[key] === '') {
      delete arg[key];
    }
  }

  // auto fill required fields
  extractKeys.forEach((item) => {
    if (item.required && !arg[item.key]) {
      arg[item.key] = item.defaultValue || '';
    }
  });

  // auth fields
  let success = !extractKeys.find((item) => !(item.key in arg));
  // auth empty value
  if (success) {
    for (const key in arg) {
      const item = extractKeys.find((item) => item.key === key);
      if (!item) {
        success = false;
        break;
      }
    }
  }

  const { totalPoints, modelName } = formatModelChars2Points({
    model: extractModel.model,
    tokens,
    modelType: ModelTypeEnum.llm
  });

  return {
    [ModuleOutputKeyEnum.success]: success ? true : undefined,
    [ModuleOutputKeyEnum.failed]: success ? undefined : true,
    [ModuleOutputKeyEnum.contextExtractFields]: JSON.stringify(arg),
    ...arg,
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      totalPoints: user.openaiAccount?.key ? 0 : totalPoints,
      model: modelName,
      query: content,
      tokens,
      extractDescription: description,
      extractResult: arg,
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
}

const getFunctionCallSchema = ({
  extractModel,
  histories,
  params: { content, extractKeys, description }
}: ActionProps) => {
  const messages: ChatItemType[] = [
    ...histories,
    {
      obj: ChatRoleEnum.Human,
      value: [
        {
          type: ChatItemValueTypeEnum.text,
          text: {
            content: `你的任务是根据上下文获取适当的 JSON 字符串。要求：
          """
          - 字符串不要换行。
          - 结合上下文和当前问题进行获取。
          """

          当前问题: "${content}"`
          }
        }
      ]
    }
  ];
  const adaptMessages = chats2GPTMessages({ messages, reserveId: false });
  const filterMessages = filterGPTMessageByMaxTokens({
    messages: adaptMessages,
    maxTokens: extractModel.maxContext
  });

  const properties: Record<
    string,
    {
      type: string;
      description: string;
    }
  > = {};
  extractKeys.forEach((item) => {
    properties[item.key] = {
      type: 'string',
      description: item.desc,
      ...(item.enum ? { enum: item.enum.split('\n') } : {})
    };
  });
  // function body
  const agentFunction = {
    name: agentFunName,
    description,
    parameters: {
      type: 'object',
      properties
    }
  };

  return {
    filterMessages,
    agentFunction
  };
};

const toolChoice = async (props: ActionProps) => {
  const { user, extractModel } = props;

  const { filterMessages, agentFunction } = getFunctionCallSchema(props);

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
    model: extractModel.model,
    temperature: 0,
    messages: filterMessages,
    tools,
    tool_choice: { type: 'function', function: { name: agentFunName } }
  });

  const arg: Record<string, any> = (() => {
    try {
      return json5.parse(
        response?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || '{}'
      );
    } catch (error) {
      console.log(agentFunction.parameters);
      console.log(response.choices?.[0]?.message?.tool_calls?.[0]?.function);
      console.log('Your model may not support tool_call', error);
      return {};
    }
  })();

  const completeMessages: ChatCompletionMessageParam[] = [
    ...filterMessages,
    {
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      tool_calls: response.choices?.[0]?.message?.tool_calls
    }
  ];

  return {
    tokens: countGptMessagesTokens(completeMessages, tools),
    arg
  };
};

const functionCall = async (props: ActionProps) => {
  const { user, extractModel } = props;

  const { agentFunction, filterMessages } = getFunctionCallSchema(props);
  const functions: ChatCompletionCreateParams.Function[] = [agentFunction];

  const ai = getAIApi({
    userKey: user.openaiAccount,
    timeout: 480000
  });

  const response = await ai.chat.completions.create({
    model: extractModel.model,
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
  extractModel,
  user,
  histories,
  params: { content, extractKeys, description }
}: ActionProps) => {
  const messages: ChatItemType[] = [
    {
      obj: ChatRoleEnum.Human,
      value: [
        {
          type: ChatItemValueTypeEnum.text,
          text: {
            content: replaceVariable(extractModel.customExtractPrompt || Prompt_ExtractJson, {
              description,
              json: extractKeys
                .map(
                  (item) =>
                    `{"key":"${item.key}", "description":"${item.desc}"${
                      item.enum ? `, "enum":"[${item.enum.split('\n')}]"` : ''
                    }}`
                )
                .join('\n'),
              text: `${histories.map((item) => `${item.obj}:${chatValue2RuntimePrompt(item.value).text}`).join('\n')}
Human: ${content}`
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
    model: extractModel.model,
    temperature: 0.01,
    messages: chats2GPTMessages({ messages, reserveId: false }),
    stream: false
  });
  const answer = data.choices?.[0].message?.content || '';

  // parse response
  const start = answer.indexOf('{');
  const end = answer.lastIndexOf('}');

  if (start === -1 || end === -1)
    return {
      rawResponse: answer,
      tokens: countMessagesTokens(messages),
      arg: {}
    };

  try {
    return {
      rawResponse: answer,
      tokens: countMessagesTokens(messages),
      arg: json5.parse(answer) as Record<string, any>
    };
  } catch (error) {
    console.log(error);
    return {
      rawResponse: answer,
      tokens: countMessagesTokens(messages),
      arg: {}
    };
  }
};
