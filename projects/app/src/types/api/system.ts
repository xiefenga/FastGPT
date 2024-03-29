export interface LLMItemResType {
  host: string;
  port: number;
  device: string;
  infer_turbo: boolean;
  version: string;
  version_url: string;
  provider: string;
  display_name: string;
  logo: string;
  online_api: boolean;
}

export type LLMResType = Record<string, LLMItemResType>;
