import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Smoke Test', () => {
  it('renders a heading', () => {
    render(<h1>Hello World</h1>);
    const heading = screen.getByText(/hello world/i);
    expect(heading).toBeInTheDocument();
  });
});
