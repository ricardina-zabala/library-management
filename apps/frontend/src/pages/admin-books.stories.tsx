import type { Meta, StoryObj } from '@storybook/react';
import { AdminBooksPage } from './admin-books.js';

const meta: Meta<typeof AdminBooksPage> = {
  title: 'Pages/AdminBooks',
  component: AdminBooksPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The AdminBooks page provides comprehensive book management functionality for administrators.
It includes CRUD operations, search/filtering, and batch management features.

**Features:**
- Create, edit, and delete books
- Advanced search and filtering
- Bulk operations for multiple books
- Book status management
- Responsive admin interface
- Modal dialogs for book operations
- Real-time data updates
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminBooksPage>;

export const BookManagement: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page showing the main management interface with book list and controls.',
      },
    },
  },
};

export const CreateBookModal: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page with create book modal opened for adding new books.',
      },
    },
  },
};

export const EditBookModal: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page with edit book modal opened for modifying existing books.',
      },
    },
  },
};

export const DeleteConfirmation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page showing delete confirmation dialog for book removal.',
      },
    },
  },
};

export const SearchAndFilter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page with active search and filter options applied.',
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page displaying loading state while fetching or updating book data.',
      },
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page showing error state when operations fail.',
      },
    },
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Admin books page displaying empty state when no books are available.',
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
        story: 'Admin books page optimized for mobile devices with responsive layout.',
      },
    },
  },
};