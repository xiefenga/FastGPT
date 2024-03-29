import { UseFormReturn, useForm } from 'react-hook-form';
import React, { useContext, useCallback, createContext, useState, useMemo, useEffect } from 'react';

import { DatasetItemType } from '@fastgpt/global/core/dataset/type';

import { ImportSourceItemType } from '@/web/core/dataset/type';

export type FormType = {
  chunk_size: number; // 单段文本最大长度
  chunk_overlap: number; // 相邻文本重合长度
  zh_title_enhance: boolean; // 中文标题加强
};

type UseImportStoreType = {
  knowledge_base_id: string;

  minChunkSize: number;
  maxChunkSize: number;

  minChunkOverlapSize: number;
  maxChunkOverlapSize: number;

  parentId?: string;
  processParamsForm: UseFormReturn<FormType, any>;

  sources: ImportSourceItemType[];
  setSources: React.Dispatch<React.SetStateAction<ImportSourceItemType[]>>;

  showRePreview: boolean;
  totalChunkChars: number;
  totalChunks: number;
  splitSources2Chunks: () => void;
};

const StateContext = createContext<UseImportStoreType>({
  knowledge_base_id: '',

  processParamsForm: {} as any,
  sources: [],
  setSources: function (value: React.SetStateAction<ImportSourceItemType[]>): void {
    throw new Error('Function not implemented.');
  },

  maxChunkSize: 0,
  minChunkSize: 0,
  minChunkOverlapSize: 0,
  maxChunkOverlapSize: 0,

  showRePreview: false,
  totalChunkChars: 0,
  totalChunks: 0,
  splitSources2Chunks: () => {}
});

export const useImportStore = () => useContext(StateContext);

interface ProviderProps {
  dataset: DatasetItemType;
  parentId?: string;
  children: React.ReactNode;
}

const Provider = ({ dataset, parentId, children }: ProviderProps) => {
  const processParamsForm = useForm<FormType>({
    defaultValues: {
      chunk_size: 250,
      chunk_overlap: 50,
      zh_title_enhance: false
    }
  });

  const [sources, setSources] = useState<ImportSourceItemType[]>([]);

  console.log('sources', sources);

  const [showRePreview, setShowRePreview] = useState(false);

  useEffect(() => {
    setShowRePreview(true);
  }, []);

  const totalChunks = useMemo(
    () => sources.reduce((sum, file) => sum + file.chunks.length, 0),
    [sources]
  );

  // 分段之后的总字数
  const totalChunkChars = useMemo(
    () => sources.reduce((sum, file) => sum + file.chunkChars, 0),
    [sources]
  );

  // 分段
  const splitSources2Chunks = useCallback(() => {
    // 分段函数实现
    // setSources((state) =>
    //   state.map((file) => {
    //     const { chunks, chars } = splitText2Chunks({
    //       text: file.rawText,
    //       chunkLen: 1024,
    //       overlapRatio: 0.2,
    //       customReg: []
    //     });
    //
    //     return {
    //       ...file,
    //       chunkChars: chars,
    //       chunks: chunks.map((chunk, i) => ({
    //         chunkIndex: i,
    //         q: chunk,
    //         a: ''
    //       }))
    //     };
    //   })
    // );
    setShowRePreview(false);
  }, []);

  const value = {
    knowledge_base_id: '',
    minChunkOverlapSize: 10,
    maxChunkOverlapSize: 500,

    minChunkSize: 50,
    maxChunkSize: 500,

    parentId,
    processParamsForm,
    sources,
    setSources,
    showRePreview,
    totalChunkChars,
    totalChunks,
    splitSources2Chunks
  } satisfies UseImportStoreType;

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export default React.memo(Provider);
