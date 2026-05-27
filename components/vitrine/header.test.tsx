import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './header';

describe('Header', () => {
  it('affiche le logo et un bouton appeler', () => {
    render(<Header />);
    expect(screen.getByAltText(/Dépôt Vente/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /appeler/i })).toBeInTheDocument();
  });
});
