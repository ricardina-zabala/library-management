import type { Meta, StoryObj } from '@storybook/react';
import { BooksPage } from './books.js';

const meta: Meta<typeof BooksPage> = {
  title: 'Pages/Books',
  component: BooksPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Books page provides the main book browsing and management interface.
It includes search functionality, filtering options, and book detail modal.

**Features:**
- Book search with query, status, and category filters
- Responsive book grid layout
- Book detail modal with borrow/return functionality
- Real-time filtering and search
- Loading and error states
- Toast notifications for user actions
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BrowsingBooks: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Books page showing the main browsing interface with search filters and book grid.',
      },
    },
  },
};

export const SearchResults: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Books page displaying filtered search results based on user query.',
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Books page showing loading state while fetching book data.',
      },
    },
  },
};

export const EmptyResults: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Books page displaying empty state when no books match the search criteria.',
      },
    },
  },
};

export const WithDetailModal: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Books page with book detail modal opened, showing detailed book information.',
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
        story: 'Books page optimized for mobile devices with responsive layout.',
      },
    },
  },
};