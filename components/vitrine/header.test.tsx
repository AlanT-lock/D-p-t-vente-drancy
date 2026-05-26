import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './header';

describe('Header', () => {
  it('affiche le nom du commerce et un bouton appeler sur mobile', () => {
    render(<Header />);
    expect(screen.getByText(/Dépôt Vente/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /appeler/i })).toBeInTheDocument();
  });
});
