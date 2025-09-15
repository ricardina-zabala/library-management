import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './layout.js';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Layout component provides the main application shell with navigation and responsive design.
It requires AuthContext and React Router to function properly.

**Features:**
- Responsive navigation with mobile menu
- Authentication-aware navigation links
- Admin-only navigation items
- User greeting and logout functionality
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedAdmin: Story = {
  args: {
    children: (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Total Books</h2>
              <p className="text-3xl font-bold text-primary-600">1,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Active Loans</h2>
              <p className="text-3xl font-bold text-green-600">56</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Available Books</h2>
              <p className="text-3xl font-bold text-blue-600">1,178</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout component as seen by an authenticated admin user with full navigation access.',
      },
    },
  },
};

export const AuthenticatedUser: Story = {
  args: {
    children: (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Library</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Current Loans</h2>
            <p className="text-gray-600">You have 2 books currently borrowed.</p>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">The Great Gatsby</p>
                <p className="text-sm text-gray-600">Due: March 15, 2025</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">To Kill a Mockingbird</p>
                <p className="text-sm text-gray-600">Due: March 20, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout component as seen by an authenticated regular user with limited navigation access.',
      },
    },
  },
};

export const Unauthenticated: Story = {
  args: {
    children: (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Library Management</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover, borrow, and manage your favorite books with ease.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Books</h3>
              <p className="text-gray-600">Explore our vast collection of books across all genres.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Borrowing</h3>
              <p className="text-gray-600">Simple and quick book borrowing process.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Loans</h3>
              <p className="text-gray-600">Keep track of your borrowed books and due dates.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout component as seen by an unauthenticated visitor with only login access.',
      },
    },
  },
};

export const MobileMenuOpen: Story = {
  args: {
    children: (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mobile Layout Demo</h1>
          <p className="text-gray-600">
            This story demonstrates the mobile menu. On mobile devices, the navigation 
            collapses into a hamburger menu. Try resizing your browser window to see 
            the responsive behavior.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Layout component optimized for mobile view with responsive navigation.',
      },
    },
  },
};