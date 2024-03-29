import { POST } from '@/web/common/api/sophonsai';

import type { LLMResType } from '@/types/api/system';

export const getModleList = () => POST<LLMResType>('/llm_model/list_running_models');
