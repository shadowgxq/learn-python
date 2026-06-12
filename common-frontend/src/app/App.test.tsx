import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the template home route', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /frontend agent template is ready/i }),
    ).toBeInTheDocument();
  });
});
