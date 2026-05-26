import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapsButtons } from './maps-buttons';

describe('MapsButtons', () => {
  it('rend 3 liens : Google, Apple, Waze', () => {
    render(<MapsButtons />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(links[1]).toHaveAttribute('href', expect.stringContaining('maps.apple.com'));
    expect(links[2]).toHaveAttribute('href', expect.stringContaining('waze.com'));
  });
});
