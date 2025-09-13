import type { Meta, StoryObj } from '@storybook/react';
import { BookCard } from './book-card.js';
import { BookStatus } from 'app-domain';

const meta = {
  title: 'Components/BookCard',
  component: BookCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: {
    book: {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      category: 'Fiction',
      publishedYear: 1925,
      totalCopies: 5,
      availableCopies: 3,
      status: BookStatus.AVAILABLE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  },
};

export const Borrowed: Story = {
  args: {
    book: {
      ...Available.args!.book,
      title: '1984',
      author: 'George Orwell',
      availableCopies: 0,
      status: BookStatus.BORROWED,
    },
  },
};

export const Maintenance: Story = {
  args: {
    book: {
      ...Available.args!.book,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      status: BookStatus.MAINTENANCE,
    },
  },
};

export const LongTitle: Story = {
  args: {
    book: {
      ...Available.args!.book,
      title: 'The Hitchhiker\'s Guide to the Galaxy: A Trilogy in Four Parts',
      author: 'Douglas Adams with a Very Long Author Name',
    },
  },
};