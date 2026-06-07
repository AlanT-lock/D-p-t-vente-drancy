import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductPrice } from './product-price';

describe('ProductPrice', () => {
  it('affiche le prix neuf barré et la réduction quand il est supérieur', () => {
    render(<ProductPrice priceCents={7500} originalCents={10000} />);
    expect(screen.getByText('75 €')).toBeInTheDocument();
    expect(screen.getByText('100 €')).toBeInTheDocument();
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('n’affiche que le prix du magasin sans prix neuf', () => {
    render(<ProductPrice priceCents={7500} originalCents={null} />);
    expect(screen.getByText('75 €')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('masque la réduction si le prix neuf est inférieur ou égal', () => {
    render(<ProductPrice priceCents={7500} originalCents={5000} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
