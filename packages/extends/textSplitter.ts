interface TextSplitterParams {
  text: string;
  chunkSize: number;
  chunkOverlapSize: number;
}

interface TextSplitterReturn {
  chunks: string[];
  chars: number;
}

export const splitText2Chunks = ({
  text,
  chunkSize,
  chunkOverlapSize
}: TextSplitterParams): TextSplitterReturn => {
  return {
    chunks: [],
    chars: 0
  };
};
