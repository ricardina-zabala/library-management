import type { Meta, StoryObj } from '@storybook/react';
import Home from './home.js';

const meta: Meta<typeof Home> = {
  title: 'Pages/Home',
  component: Home,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Home page serves as the main landing page for the library management system.
It displays different content based on the user's authentication status.

**Features:**
- Welcome message and system overview
- Authentication-aware content
- Quick navigation to main features
- Responsive grid layout
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedUser: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Home page as seen by an authenticated user with personalized greeting and quick access to main features.',
      },
    },
  },
};

export const UnauthenticatedVisitor: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Home page as seen by an unauthenticated visitor with system overview and call-to-action to sign up.',
      },
    },
  },
};

export const ResponsiveLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Home page optimized for mobile devices with responsive grid layout.',
      },
    },
  },
};