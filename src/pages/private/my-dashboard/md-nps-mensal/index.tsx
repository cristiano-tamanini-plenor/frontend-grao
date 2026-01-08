import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useMDNPSMensal } from './useMDNPSMensal';

export default function MDNPSMensal() {
  const { data } = useMDNPSMensal();
  const [npsView, setNpsView] = useState<'votos' | 'notas'>('notas');

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>NPS Mensal</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={npsView === 'votos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNpsView('votos')}
            >
              Votos
            </Button>
            <Button
              variant={npsView === 'notas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNpsView('notas')}
            >
              Notas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{
              top: 15,
              right: 20,
              left: 10,
              bottom: 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="mes" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => {
                if (npsView === 'votos') {
                  return value.toString();
                }
                return value.toFixed(1);
              }}
            />
            <Tooltip 
              formatter={(value: number) => {
                if (npsView === 'votos') {
                  return [`${value} votos`, 'Votos'];
                }
                return [value.toFixed(1), 'Nota média'];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={npsView} 
              stroke="#15B8A6" 
              strokeWidth={2}
              name={npsView === 'votos' ? 'Votos' : 'Nota média'}
              dot={{ r: 4, fill: '#15B8A6' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

