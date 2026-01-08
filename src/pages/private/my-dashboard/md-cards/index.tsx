import CardFaturamento from './cardFaturamento';
import CardCarteira from './cardCarteira';
import CardComissao from './cardComissao';
import CardNPS from './cardNPS';

interface MDCardsProps {
  analystId: number | null;
}

export default function MDCards({ analystId }: MDCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      <CardFaturamento analystId={analystId} />
      <CardCarteira analystId={analystId} />
      <CardComissao analystId={analystId} />
      <CardNPS analystId={analystId} />
    </div>
  );
}

