import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerSelect } from './CustomerSelect';
import { SituationMultiSelect } from './SituationMultiSelect';

interface SalesFiltersDrawerProps {
  codeReference?: string;
  peopleId?: string;
  situation?: string[];
}

export interface SalesFiltersDrawerRef {
  getFilters: () => {
    codeReference?: string;
    peopleId?: string;
    situation?: string[];
  };
  resetFilters: () => void;
}

export const SalesFiltersDrawer = forwardRef<SalesFiltersDrawerRef, SalesFiltersDrawerProps>(
  ({ codeReference, peopleId, situation }, ref) => {
    const [codeReferenceValue, setCodeReferenceValue] = useState<string>(
      codeReference || ''
    );
    const [peopleIdValue, setPeopleIdValue] = useState<number | string | undefined>(
      peopleId ? (typeof peopleId === 'string' ? parseInt(peopleId, 10) : peopleId) : undefined
    );
    // Valores padrão: 1 (Pendente), 2 (Efetivada), 4 (Liquidado)
    const defaultSituation = ['1', '2', '4'];
    const [situationValue, setSituationValue] = useState<string[]>(
      situation && situation.length > 0 ? situation : defaultSituation
    );

    // Atualiza quando as props mudam (quando o drawer abre)
    useEffect(() => {
      setCodeReferenceValue(codeReference || '');
      setPeopleIdValue(peopleId ? (typeof peopleId === 'string' ? parseInt(peopleId, 10) : peopleId) : undefined);
      setSituationValue(situation && situation.length > 0 ? situation : defaultSituation);
    }, [codeReference, peopleId, situation]);

    // Expõe método para obter os filtros atuais
    useImperativeHandle(ref, () => ({
      getFilters: () => {
        const filters: {
          codeReference?: string;
          peopleId?: string;
          situation?: string[];
        } = {};

        if (codeReferenceValue.trim()) {
          filters.codeReference = codeReferenceValue.trim();
        }

        if (peopleIdValue) {
          filters.peopleId = String(peopleIdValue);
        }

        // Sempre retorna situation (mesmo que seja o padrão)
        filters.situation = situationValue.length > 0 ? situationValue : defaultSituation;

        return filters;
      },
      resetFilters: () => {
        setCodeReferenceValue('');
        setPeopleIdValue(undefined);
        setSituationValue(defaultSituation);
      },
    }));

    return (
      <div className="space-y-6">
        <CustomerSelect
          value={peopleIdValue}
          onChange={setPeopleIdValue}
          label="Cliente"
          placeholder="Selecione um cliente..."
        />
        <SituationMultiSelect
          value={situationValue}
          onChange={setSituationValue}
          label="Situação"
        />
        <div className="space-y-2">
          <Label htmlFor="code-reference">Código de Referência</Label>
          <Input
            id="code-reference"
            placeholder="Digite o código de referência"
            value={codeReferenceValue}
            onChange={(e) => setCodeReferenceValue(e.target.value)}
          />
        </div>
      </div>
    );
  }
);

SalesFiltersDrawer.displayName = 'SalesFiltersDrawer';

