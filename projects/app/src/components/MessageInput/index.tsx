import { customAlphabet } from 'nanoid';
import { useTranslation } from 'next-i18next';
import React, { useRef, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Box, Flex, Spinner, Textarea } from '@chakra-ui/react';

import VoiceInput from './components/VoiceInput';
import FilePreview from './components/FilePreview';
import InputButton from './components/InputButton';
import FileSelector from './components/FileSelector';
import { useSpeech } from '@/web/common/hooks/useSpeech';
import { useRequest } from '@/web/common/hooks/useRequest';
import MessageTextarea from './components/MessageTextarea';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { ChatFileTypeEnum } from '@fastgpt/global/core/chat/constants';
import { ChatBoxInputType, UserInputFileItemType } from '../ChatBox/type';
import TranslateIndicator from '@/components/MessageInput/components/TranslateIndicator';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

interface MessageInputFormType {
  input: string;
  files: UserInputFileItemType[];
}

interface MessageInputProps {
  onSendMessage?: (val: ChatBoxInputType) => void;
  onStop?: () => void;
  isChatting?: boolean;
  showFileSelector?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStop,
  isChatting = false,
  showFileSelector = false
}) => {
  const textareaDom = useRef<HTMLTextAreaElement>(null);

  const chatForm = useForm<MessageInputFormType>({
    defaultValues: {
      input: '',
      files: []
    }
  });

  const { setValue, watch, control } = chatForm;

  const inputValue = watch('input');

  const {
    update: updateFile,
    remove: removeFile,
    fields: fileList,
    append: appendFile,
    replace: replaceFile
  } = useFieldArray({
    control,
    name: 'files'
  });

  const {
    isSpeaking,
    isTransCription,
    stopSpeak,
    startSpeak,
    speakingTimeString,
    renderAudioGraph,
    stream
  } = useSpeech();

  const { isPc = true } = useSystemStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  const havInput = !!inputValue || fileList.length > 0;

  const { mutate: uploadFile } = useRequest({
    mutationFn: async ({ file, fileIndex }: { file: UserInputFileItemType; fileIndex: number }) => {
      if (file.type === ChatFileTypeEnum.image && file.rawFile) {
        try {
          // TODO: 上传图片
          const url = `${location.origin}${fileIndex}`;
          updateFile(fileIndex, { ...file, url });
        } catch (error) {
          removeFile(fileIndex);
          console.log(error);
          return Promise.reject(error);
        }
      }
    },
    errorToast: t('common.Upload File Failed')
  });

  const onSelectFile = async (files: File[]) => {
    if (!files || files.length === 0) {
      return;
    }
    const loadFiles = await Promise.all(
      files.map(
        (file) =>
          new Promise<UserInputFileItemType>((resolve, reject) => {
            if (file.type.includes('image')) {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                const item = {
                  id: nanoid(),
                  rawFile: file,
                  type: ChatFileTypeEnum.image,
                  name: file.name,
                  icon: reader.result as string
                };
                resolve(item);
              };
              reader.onerror = () => {
                reject(reader.error);
              };
            } else {
              resolve({
                id: nanoid(),
                rawFile: file,
                type: ChatFileTypeEnum.file,
                name: file.name,
                icon: 'file/pdf'
              });
            }
          })
      )
    );
    appendFile(loadFiles);

    loadFiles.forEach((file, i) =>
      uploadFile({
        file,
        fileIndex: i + fileList.length
      })
    );
  };

  const onPressEnter = async () => {
    if (havInput) {
      onSendMessage?.({ text: inputValue.trim(), files: fileList });
      replaceFile([]);
    }
  };

  useEffect(() => {
    if (!stream) {
      return;
    }
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 1;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const renderCurve = () => {
      if (!canvasRef.current) {
        return;
      }
      renderAudioGraph(analyser, canvasRef.current);
      window.requestAnimationFrame(renderCurve);
    };
    renderCurve();
  }, [renderAudioGraph, stream]);

  const showVioceInput = !havInput && !isChatting;

  return (
    <Box m={['0 auto', '10px auto']} w={'100%'} maxW={['auto', 'min(800px, 100%)']} px={[0, 5]}>
      <Box
        pt={fileList.length > 0 ? '10px' : ['14px', '18px']}
        pb={['14px', '18px']}
        position={'relative'}
        boxShadow={isSpeaking ? `0 0 10px rgba(54,111,255,0.4)` : `0 0 10px rgba(0,0,0,0.2)`}
        borderRadius={['none', 'md']}
        bg={'white'}
        overflow={'hidden'}
        {...(isPc
          ? {
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.12)'
            }
          : {
              borderTop: '1px solid',
              borderTopColor: 'rgba(0,0,0,0.15)'
            })}
      >
        {/* translate indicator */}
        <TranslateIndicator isTransCription={isTransCription} isSpeaking={isSpeaking} />

        {/* file preview */}
        <FilePreview fileList={fileList} removeFile={removeFile} />

        <Flex alignItems={'flex-end'} mt={fileList.length > 0 ? 1 : 0} pl={[2, 4]}>
          {/* file selector */}
          {showFileSelector && <FileSelector onSelectFile={onSelectFile} />}

          {/* input area */}
          <MessageTextarea
            isPc={isPc}
            textareaDom={textareaDom}
            isSpeaking={isSpeaking}
            value={inputValue}
            setValue={(val) => setValue('input', val)}
            onPressEnter={onPressEnter}
            showFileSelector={showFileSelector}
            onSelectFile={onSelectFile}
          />

          {/* controls */}
          <Flex alignItems={'center'} position={'absolute'} right={[2, 4]} top={0} h={'100%'}>
            {/* voice-input */}
            {showVioceInput && (
              <VoiceInput
                canvasRef={canvasRef}
                stopSpeak={stopSpeak}
                startSpeak={startSpeak}
                isSpeaking={isSpeaking}
                isTransCription={isTransCription}
                speakingTimeString={speakingTimeString}
              />
            )}
            {/* send and stop button */}
            {!isSpeaking && (
              <InputButton
                havInput={havInput}
                isChatting={isChatting}
                onClick={() => {
                  isChatting ? onStop?.() : onPressEnter();
                }}
              />
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default React.memo(MessageInput);
