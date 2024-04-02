import React from 'react';
import { Input, FormControl, InputProps, FormErrorMessage, Center } from '@chakra-ui/react';

type RuleItem = { required: boolean; message: string } | { pattern: RegExp; message: string };

interface EditableInputProps extends InputProps {
  label?: React.ReactNode;
  defaultValue?: string;
  onEdit?: (val: string) => void | Promise<void>;
  rules?: RuleItem[];
}

const EditableInput: React.FC<EditableInputProps> = ({
  label,
  rules = [],
  onEdit,
  defaultValue = '',
  onBlur: outerOnBlur,
  onChange: outerOnChange,
  ...props
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      outerOnChange?.(e);
    },
    [outerOnChange]
  );

  const onBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setValue(defaultValue);
      outerOnBlur?.(e);
    },
    [defaultValue, outerOnBlur]
  );

  const messages = rules
    .map((rule) => {
      if ('required' in rule && rule.required && !value) {
        return rule.message;
      }
      if ('pattern' in rule && !rule.pattern.test(value)) {
        return rule.message;
      }
    })
    .filter(Boolean) as string[];

  const isError = messages.length > 0;

  const message = isError ? messages[0] : '';

  return (
    <FormControl isInvalid={isError}>
      <Center>
        {label}
        <Input
          ref={ref}
          {...props}
          value={value}
          borderColor={'transparent'}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={async (e) => {
            try {
              if (!isError && e.code === 'Enter' && value !== defaultValue) {
                await onEdit?.(value);
                ref.current?.blur();
              }
            } catch {}
          }}
        />
      </Center>
      {isError && <FormErrorMessage>{message}</FormErrorMessage>}
    </FormControl>
  );
};

export default EditableInput;
