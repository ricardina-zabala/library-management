import type { Meta, StoryObj } from '@storybook/react';
import { LoansPage } from './loans.js';

const meta: Meta<typeof LoansPage> = {
  title: 'Pages/Loans',
  component: LoansPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Loans page displays and manages a user's borrowed books.
It shows loan details, due dates, and provides return functionality.

**Features:**
- Display user's active and past loans
- Due date tracking with overdue indicators
- Book return functionality
- Loading and error states
- Responsive table/card layout
- Toast notifications for actions
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveLoans: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Loans page showing active book loans with due dates and return options.',
      },
    },
  },
};

export const OverdueLoans: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Loans page displaying overdue books with warning indicators.',
      },
    },
  },
};

export const NoActiveLoans: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Loans page showing empty state when user has no active loans.',
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Loans page displaying loading indicator while fetching loan data.',
      },
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Loans page showing error state when loan data cannot be loaded.',
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
        story: 'Loans page optimized for mobile devices with card-based layout.',
      },
    },
  },
};