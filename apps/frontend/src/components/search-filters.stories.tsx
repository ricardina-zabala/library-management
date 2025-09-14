import type { Meta, StoryObj } from '@storybook/react';
import { SearchFilters } from './search-filters.js';
import { BookStatus } from 'app-domain';

const meta = {
  title: 'Components/SearchFilters',
  component: SearchFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCategories = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Romance',
  'Mystery',
  'Biography',
  'History',
  'Science',
  'Technology',
  'Art'
];

export const Default: Story = {
  args: {
    categories: sampleCategories,
    onSearch: (query: string) => console.log('Search:', query),
    onFilterByStatus: (status: BookStatus | 'all') => console.log('Status filter:', status),
    onFilterByCategory: (category: string) => console.log('Category filter:', category),
  },
};

export const WithoutCategories: Story = {
  args: {
    onSearch: (query: string) => console.log('Search:', query),
    onFilterByStatus: (status: BookStatus | 'all') => console.log('Status filter:', status),
  },
};

export const CustomPlaceholder: Story = {
  args: {
    categories: sampleCategories,
    placeholder: "Find your next great read...",
    onSearch: (query: string) => console.log('Search:', query),
    onFilterByStatus: (status: BookStatus | 'all') => console.log('Status filter:', status),
    onFilterByCategory: (category: string) => console.log('Category filter:', category),
  },
};

export const Interactive: Story = {
  args: {
    categories: sampleCategories,
    onSearch: (query: string) => {
      console.log('Search query:', query);
      setTimeout(() => {
        console.log('Search results for:', query);
      }, 500);
    },
    onFilterByStatus: (status: BookStatus | 'all') => {
      console.log('Filtering by status:', status);
    },
    onFilterByCategory: (category: string) => {
      console.log('Filtering by category:', category);
    },
  },
};