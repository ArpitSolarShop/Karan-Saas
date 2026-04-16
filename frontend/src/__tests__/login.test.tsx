import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/agent@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('submits the form with email and password', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/agent@company.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    
    // Use a more specific selector for the submit button
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
