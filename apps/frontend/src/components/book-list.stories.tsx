import type { Meta, StoryObj } from '@storybook/react';
import { BookList } from './book-list.js';
import { BookStatus } from 'app-domain';

const meta = {
  title: 'Components/BookList',
  component: BookList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBooks = [
  {
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
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    category: 'Dystopian Fiction',
    publishedYear: 1949,
    totalCopies: 3,
    availableCopies: 0,
    status: BookStatus.BORROWED,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    category: 'Fiction',
    publishedYear: 1960,
    totalCopies: 4,
    availableCopies: 2,
    status: BookStatus.AVAILABLE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '978-0-316-76948-0',
    category: 'Fiction',
    publishedYear: 1951,
    totalCopies: 2,
    availableCopies: 1,
    status: BookStatus.RESERVED,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0-14-143951-8',
    category: 'Romance',
    publishedYear: 1813,
    totalCopies: 6,
    availableCopies: 0,
    status: BookStatus.MAINTENANCE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const Default: Story = {
  args: {
    books: sampleBooks,
  },
};

export const WithActions: Story = {
  args: {
    books: sampleBooks,
    onBorrow: (bookId: string) => console.log('Borrow book:', bookId),
    onReturn: (bookId: string) => console.log('Return book:', bookId),
    onDetails: (bookId: string) => console.log('View details:', bookId),
  },
};

export const Loading: Story = {
  args: {
    books: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    books: [],
    emptyMessage: 'No books match your search criteria',
  },
};

export const SingleBook: Story = {
  args: {
    books: sampleBooks.slice(0, 1),
    onBorrow: (bookId: string) => console.log('Borrow book:', bookId),
    onDetails: (bookId: string) => console.log('View details:', bookId),
  },
};