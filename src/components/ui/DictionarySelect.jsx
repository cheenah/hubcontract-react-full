import React from 'react';
import useDictionaryStore from '@/store/dictionaryStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DictionarySelect = ({ dictType, value, onChange, placeholder, disabled }) => {
  const items = useDictionaryStore((s) => s.dictionaries[dictType] ?? []);
  const isLoading = useDictionaryStore((s) => s.isLoading);

  const isDisabled = disabled || isLoading;

  return (
    <Select
      value={value ?? ''}
      onValueChange={onChange}
      disabled={isDisabled}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={isLoading ? 'Загрузка...' : (placeholder ?? 'Выберите...')}
        />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.name_ru}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DictionarySelect;
