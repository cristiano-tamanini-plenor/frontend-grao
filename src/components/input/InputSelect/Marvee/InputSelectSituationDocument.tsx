import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { InputMultiSelect } from '../InputMultiSelect';

interface InputSelectSituationDocumentProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
}

const SITUATION_OPTIONS = [
  { value: '1', label: 'Pendente' },
  { value: '2', label: 'Efetivada' },
  { value: '3', label: 'Cancelado' },
  { value: '4', label: 'Liquidado' },
];

export const InputSelectSituationDocument = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Situação do Documento',
  description,
  required = false,
}: InputSelectSituationDocumentProps<TFieldValues>) => {
  return (
    <InputMultiSelect
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      options={SITUATION_OPTIONS}
    />
  );
};

