export type Card = {
  id: string;
  symbol: string;
  matched: boolean;
};

const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const generateShuffledCards = (): Card[] => {
  const cards: Card[] = [];

  symbols.forEach((s, i) => {
    cards.push({ id: `${s}-${i}-1`, symbol: s, matched: false });
    cards.push({ id: `${s}-${i}-2`, symbol: s, matched: false });
  });

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};
