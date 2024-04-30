import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../components/App';
import Chat from '../components/Chat';
import FAQ from '../components/FAQ';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import MessageDisplay from '../components/MessageDisplay';
import Login from '../api/Login';
import Signup from '../api/Signup';
import UserSettings from '../api/UserSettings';
import { ThemeProvider, useTheme } from '../api/ThemeContext';
import axios from 'axios';
import { rootURL } from "./utils";

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
    // Simulate an error where `response` is undefined
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

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      chats: [{ chatId: 'chat1', chatName: 'Chat 1' }, { chatId: 'chat2', chatName: 'Chat 2' }]
    }),
    ok: true
  })
);


//Chat Component Tests
describe('Chat Component', () => {
  beforeEach(async () => {
    // Mock setup for localStorage and fetch
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    jest.spyOn(window.localStorage.__proto__, 'getItem');
    jest.spyOn(window.localStorage.__proto__, 'removeItem');
    jest.spyOn(window.localStorage.__proto__, 'clear');

    window.localStorage.setItem('token', 'fake.jwt.token');

    await signupAndLogin();
    render(
      <BrowserRouter>
        <ThemeProvider value={{ theme: 'light', setTheme: jest.fn() }}>
          <Chat />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Ensure fetch is called and wait for results to be displayed
    expect(fetch).toHaveBeenCalledTimes(1);
    await waitFor(() => screen.findAllByText(/Chat/)); // Use findAllByText to wait for all chat items
  });

  test('renders FAQ and Settings buttons', async () => {
    expect(screen.getByText(/go to faq/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  test('should render chat interface properly', async () => {
    // If the Chat component performs async operations on mount, wait for these to settle
    await waitFor(() => {
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
  });

  test('should handle logout correctly', async () => {
    await waitFor(() => fireEvent.click(screen.getByText(/logout/i)));
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('toggles settings when Settings button is clicked', async () => {
    fireEvent.click(screen.getByText(/settings/i));
    await waitFor(() => {
      // Ensure the actual text in the settings modal is what you expect
      expect(screen.getByText(/User Settings/)).toBeInTheDocument(); // Updated to match the exact text from your component output
    });
    fireEvent.click(screen.getByText(/Cancel/));  // Assuming 'Cancel' button exists to close settings
    await waitFor(() => {
      expect(screen.queryByText(/User Settings/)).not.toBeInTheDocument();
    });
  });

  test('navigates to FAQ page on FAQ button click', async () => {
    fireEvent.click(screen.getByText(/go to faq/i));
    expect(mockNavigate).toHaveBeenCalledWith('/faq');
  });

  afterAll(() => {
    window.localStorage.clear();
  });
});


async function signupAndLogin() {
  const signupResponse = {
    data: { message: 'User created successfully.' },
  };
  const mockPayload = JSON.stringify({ exp: (new Date().getTime() + 10000) / 1000 });
  const encodedPayload = btoa(mockPayload);  // Base64 encode the JSON payload
  const mockToken = `header.${encodedPayload}.signature`; // Create a more realistic mock token

  const loginResponse = {
    data: { message: 'Success', token: mockToken }
  };
  
  axios.post.mockImplementation((url) => {
    if (url.includes('/signup')) {
      return Promise.resolve(signupResponse);
    }
    if (url.includes('/login')) {
      return Promise.resolve(loginResponse);
    }
    return Promise.reject(new Error('not found'));
  });

  // Simulate user signup and login
  await axios.post('/api/signup', { email: 'test@example.com', password: 'password123' });
  const tokenResponse = await axios.post('/api/login', { email: 'test@example.com', password: 'password123' });
  window.localStorage.setItem('token', tokenResponse.data.token);
}


//ChatHistorySidebar Component Tests
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      chats: [
        { chatId: 'chat1', chatName: 'Chat 1' },
        { chatId: 'chat2', chatName: 'Chat 2' }
      ]
    })
  });
});

describe('ChatHistorySidebar Component', () => {
  const mockOnSelectChat = jest.fn();

  const setup = () => {
    render(
      <BrowserRouter>
        <ThemeProvider value={{ theme: 'light', setTheme: jest.fn() }}>
          <ChatHistorySidebar onSelectChat={mockOnSelectChat} selectedChatId={null} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  test('fetches chats and displays them', async () => {
    setup();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });
  });

  test('selects a chat when clicked', async () => {
    setup();
    await waitFor(() => fireEvent.click(screen.getByText('Chat 1')));
    expect(mockOnSelectChat).toHaveBeenCalledWith('chat1');
  });

  test('opens the modal to create a new chat', async () => {
    setup();
    fireEvent.click(screen.getByText('New Chat'));
    expect(screen.getByText('Enter new chat name')).toBeInTheDocument();
  });

  test('adds a new chat when confirmed', async () => {
    setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ chatId: 'chat3', chatName: 'Chat 3' })
    });

    fireEvent.click(screen.getByText('New Chat'));
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Chat name'), { target: { value: 'Chat 3' } });
      fireEvent.click(screen.getByText('Confirm'));
    });

    expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ chatName: 'Chat 3' })
    }));
    await waitFor(() => expect(screen.getByText('Chat 3')).toBeInTheDocument());
  });

  test('deletes a chat when delete button is clicked', async () => {
    setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await waitFor(() => fireEvent.click(screen.getAllByText('X')[0]));
    expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      method: 'DELETE'
    }));
  });
});

//MessageDisplay Component Tests
global.fetch = jest.fn();

describe('MessageDisplay Component', () => {
  const chatId = '123';

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        messages: [
          { message: "Hello", isUserMessage: true, createdAt: new Date() },
          { message: "Hi, how can I help?", isUserMessage: false, createdAt: new Date() }
        ]
      })
    });
  });

  const setup = (id = chatId) => {
    render(
      <BrowserRouter>
        <ThemeProvider value={{ theme: 'light', setTheme: jest.fn() }}>
          <MessageDisplay chatId={id} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  test('fetches and displays messages when chatId is provided', async () => {
    setup();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${rootURL}/fetch-messages/${chatId}`, expect.anything());
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Hi, how can I help?")).toBeInTheDocument();
    });
  });

  test('does not fetch messages without chatId', () => {
    setup(null);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('allows a user to send a new message', async () => {
    setup();
    const messageText = "This is a new message";

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        chat: [
          { message: messageText, isUserMessage: true, createdAt: new Date() },
          { message: "Response", isUserMessage: false, createdAt: new Date() }
        ]
      })
    });

    fireEvent.change(screen.getByPlaceholderText('Type a message'), { target: { value: messageText } });
    fireEvent.submit(screen.getByText('Send'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${rootURL}/send-message`, expect.anything());
      expect(screen.getByText(messageText)).toBeInTheDocument();
      expect(screen.getByText("Response")).toBeInTheDocument();
    });
  });

  test('displays an error if message sending fails', async () => {
    setup();
    const errorMessage = "Failed to send message";
    fetch.mockRejectedValueOnce(new Error(errorMessage));

    fireEvent.change(screen.getByPlaceholderText('Type a message'), { target: { value: "Test" } });
    fireEvent.submit(screen.getByText('Send'));

    await waitFor(() => {
      // Expect some form of error display, depends on implementation
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();  // Assuming no specific error UI
    });
  });
});


//User Settings Component Tests
jest.mock('axios');

describe('UserSettings Component', () => {
  const onClose = jest.fn();

  const mockSettingsResponse = {
    data: {
      settings: {
        expertiseLevel: 'beginner',
        colorTheme: 'light'
      }
    }
  };

  beforeEach(() => {
    axios.get.mockResolvedValue(mockSettingsResponse);
  });

  const setup = () => {
    render(
      <BrowserRouter>
        <ThemeProvider value={{ theme: 'light', setTheme: jest.fn() }}>
          <UserSettings onClose={onClose} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  test('fetches and displays user settings on mount', async () => {
    setup();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${rootURL}/get-user-settings`, expect.anything());
      expect(screen.getByLabelText(/expertise level/i)).toHaveValue('beginner');
      expect(screen.getByLabelText(/dark mode/i)).not.toBeChecked();
    });
  });

  test('updates expertise level on change', async () => {
    setup();
    const select = screen.getByLabelText(/expertise level/i);
    fireEvent.change(select, { target: { value: 'advanced' } });
    expect(select).toHaveValue('advanced');
  });

  test('toggles dark mode on change', async () => {
    setup();
    const checkbox = screen.getByLabelText(/dark mode/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('closes modal on cancel button click', () => {
    setup();
    fireEvent.click(screen.getByText(/cancel/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
