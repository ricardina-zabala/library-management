import type { Meta, StoryObj } from '@storybook/react';
import { AuthPage } from './auth.js';

const meta: Meta<typeof AuthPage> = {
  title: 'Pages/Auth',
  component: AuthPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Auth page handles both login and registration functionality for the library management system.
It provides a unified interface with form switching between login and register modes.

**Features:**
- Toggle between login and registration forms
- Form validation and error handling
- Password visibility toggle
- Loading states during authentication
- Responsive design with centered layout
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Auth page displaying the login form with email and password fields.',
      },
    },
  },
};

export const RegisterForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Auth page displaying the registration form with additional name fields.',
      },
    },
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Auth page showing error state after failed authentication attempt.',
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Auth page during authentication request with loading indicator.',
      },
    },
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Auth page optimized for mobile devices with responsive form layout.',
      },
    },
  },
};