import React, { useState } from 'react';
import { StepableDateRange } from './index';
import type { DateRange } from 'react-day-picker';

export function StepableDateRangeExample() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleChangeDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Exemplo de Uso - StepableDateRange</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Uso Básico</h3>
            <StepableDateRange
              label="Selecione um período"
              name="basicDateRange"
              onChange={handleChangeDateRange}
              value={dateRange}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Com Placeholder Personalizado</h3>
            <StepableDateRange
              label="Período de análise"
              name="customPlaceholder"
              placeholder="Escolha o período para análise"
              onChange={handleChangeDateRange}
              value={dateRange}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Com Validação</h3>
            <StepableDateRange
              label="Período obrigatório"
              name="requiredDateRange"
              required
              onChange={handleChangeDateRange}
              value={dateRange}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Desabilitado</h3>
            <StepableDateRange
              label="Período desabilitado"
              name="disabledDateRange"
              disabled
              onChange={handleChangeDateRange}
              value={dateRange}
            />
          </div>
        </div>

        {dateRange && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Valor Selecionado:</h3>
            <p className="text-sm text-gray-600">
              De: {dateRange.from?.toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-gray-600">
              Até: {dateRange.to?.toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Dica:</strong> Use os inputs de data manual ou clique nas opções pré-definidas para seleção rápida!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
