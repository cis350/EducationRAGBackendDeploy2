/**import { render, screen } from '@testing-library/react';
import App from '../components/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Login/i);
  expect(linkElement).toBeInTheDocument();
});*/


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../components/App';
import Chat from '../components/Chat';
import FAQ from '../components/FAQ';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import MessageDisplay from '../components/MessageDisplay';
import Login from '../api/Login';
import Signup from '../api/Signup';
import { ThemeProvider, useTheme } from '../api/ThemeContext';
import axios from 'axios';



// Mock axios globally
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));




//App Component Tests
describe('App Component', () => {
  test('renders the main routes correctly', () => {
    render(<App />);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});

//Login Component Tests
describe('Login Component', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    mockNavigate.mockReset();
    axios.post.mockReset();
    axios.get.mockReset();
    render(
      <ThemeProvider value={{ setTheme: mockSetTheme }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </ThemeProvider>
    );
  });

  test('successfully logs in and navigates', async () => {
    axios.post.mockResolvedValue({ data: { message: "Success", token: "12345" } });
    axios.get.mockResolvedValue({ data: { settings: { colorTheme: 'dark' } } });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  test('displays error message on login failure', async () => {
    axios.post.mockResolvedValue({ data: { message: "Invalid credentials" } });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });

  test('handles network errors gracefully', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Network error" } }
    });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
  });

  test('renders sign-up link', () => {
    const signUpLink = screen.getByText("Sign up");
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});



//Signup Component Tests
describe('Signup Component', () => {
  beforeEach(() => {
    delete window.location;
    window.location = {
      _href: '',
      get href() {
        return this._href;
      },
      set href(newValue) {
        this._href = newValue;
      }
    };
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
  });
  
  test('shows a success message and redirects after successful signup', async () => {
    const mockSuccessResponse = { data: { message: 'User created successfully.' } };
    axios.post.mockResolvedValue(mockSuccessResponse);
  
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  
    await waitFor(() => expect(screen.getByText(/registration successful\. redirecting to login\.\.\./i)).toBeInTheDocument());
  });

  test('shows a password length error if password is too short', () => {
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
  });


  test('displays an error message when the server fails to register the account', async () => {
    const mockErrorResponse = { response: { data: { message: 'Failed to register account.' } } };
    axios.post.mockRejectedValue(mockErrorResponse);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => expect(screen.getByText(/failed to register account\./i)).toBeInTheDocument());
  });

  test('displays a general error message when an unexpected error occurs', async () => {
    // Simulate an error where response is undefined
    axios.post.mockRejectedValue({});
  
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  
    await waitFor(() => expect(screen.getByText(/an error occurred\. please try again\./i)).toBeInTheDocument());
  });

  test('renders log in link correctly', () => {
    const loginLink = screen.getByText(/log in/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});



//FAQ Component Tests
describe('FAQ Component', () => {
  test('renders and toggles questions', () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    );
    const questionButton = screen.getByText(/what is CIS-3500\?/i);
    fireEvent.click(questionButton);
    expect(screen.getByText(/focuses on advanced topics in software development/i)).toBeVisible();
  });

  test('renders all FAQ items', () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    );
    const questions = screen.getAllByText(/CIS-3500|AI chatbot|free to use|interact with the AI chatbot|specific coding problems/i);
  });

  test('expands and collapses FAQ items', async () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    );
  
    // Click to expand the FAQ item.
    const questionButton = screen.getByText(/What is CIS-3500\?/i);
    fireEvent.click(questionButton);

    // Check if the button aria-expanded attribute is true after expansion.
    expect(questionButton).toHaveAttribute('aria-expanded', 'true');

    // Click again to collapse.
    fireEvent.click(questionButton);

    // Use waitFor to check if the button aria-expanded attribute is false after collapse.
    await waitFor(() => {
      expect(questionButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test('navigates back to the chat on button click', () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    );
  
    const backButton = screen.getByText(/Back to Chat/i);
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/chat');
  });
});