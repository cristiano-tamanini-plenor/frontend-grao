import CardMeusInvestimentos from './cardMeusInvestimentos';
import CardDistribuicaoLucros from './cardDistribuicaoLucros';
import CardRentabilidade from './cardRentabilidade';
import CardPatrimonioTotal from './cardPatrimonioTotal';

export default function InvestmentCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      <CardMeusInvestimentos />
      <CardDistribuicaoLucros />
      <CardRentabilidade />
      <CardPatrimonioTotal />
    </div>
  );
}
