import React from 'react';
import { Textarea } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import { textareaMinH } from '../constants';

interface MessageTextareaProps {
  isSpeaking: boolean;
  value: string;
  setValue: (value: any) => void;
  textareaDom: React.RefObject<HTMLTextAreaElement>;
  isPc: boolean;
  showFileSelector: boolean;
  onPressEnter: (value: string) => void;
  onSelectFile: (files: File[]) => void;
}

const MessageTextarea = ({
  isPc,
  textareaDom,
  isSpeaking,
  value,
  setValue,
  onPressEnter,
  showFileSelector,
  onSelectFile
}: MessageTextareaProps) => {
  const { t } = useTranslation();

  return (
    <Textarea
      ref={textareaDom}
      py={0}
      pl={2}
      pr={['30px', '48px']}
      border={'none'}
      _focusVisible={{
        border: 'none'
      }}
      placeholder={isSpeaking ? t('core.chat.Speaking') : t('core.chat.Type a message')}
      resize={'none'}
      rows={1}
      height={'22px'}
      lineHeight={'22px'}
      maxHeight={'50vh'}
      maxLength={-1}
      overflowY={'auto'}
      whiteSpace={'pre-wrap'}
      wordBreak={'break-all'}
      boxShadow={'none !important'}
      color={'myGray.900'}
      isDisabled={isSpeaking}
      value={value}
      onChange={(e) => {
        const textarea = e.target;
        textarea.style.height = textareaMinH;
        textarea.style.height = `${textarea.scrollHeight}px`;
        setValue(textarea.value);
      }}
      onKeyDown={(e) => {
        const isEnter = e.key.toLowerCase() === 'enter';

        // 换行(⌃ / ⌥ / ⇧ / ⌘ + ↩)
        if (isEnter && textareaDom.current && (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)) {
          textareaDom.current.style.height = textareaMinH;
          textareaDom.current.style.height = `${textareaDom.current.scrollHeight}px`;
          return;
        }

        if ((isPc || window !== parent) && isEnter && !e.shiftKey) {
          onPressEnter((e.target as HTMLTextAreaElement).value);
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        const clipboardData = e.clipboardData;
        if (clipboardData && showFileSelector) {
          const items = clipboardData.items;
          const files = Array.from(items)
            .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
            .filter(Boolean) as File[];
          onSelectFile(files);
        }
      }}
    />
  );
};

export default MessageTextarea;
