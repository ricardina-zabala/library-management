import type { Meta, StoryObj } from '@storybook/react';
import { BookDetailModal } from './book-detail-modal.js';
import { BookStatus } from 'app-domain';

const meta: Meta<typeof BookDetailModal> = {
  title: 'Components/BookDetailModal',
  component: BookDetailModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBookAvailable = {
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
};

const sampleBookBorrowed = {
  id: '2',
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  isbn: '978-0-06-112008-4',
  category: 'Classic Literature',
  publishedYear: 1960,
  totalCopies: 3,
  availableCopies: 0,
  status: BookStatus.BORROWED,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const sampleBookMaintenance = {
  id: '3',
  title: '1984',
  author: 'George Orwell',
  isbn: '978-0-452-28423-4',
  category: 'Dystopian Fiction',
  publishedYear: 1949,
  totalCopies: 4,
  availableCopies: 0,
  status: BookStatus.MAINTENANCE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const AvailableBookCanBorrow: Story = {
  args: {
    book: sampleBookAvailable,
    isOpen: true,
    canBorrow: true,
    canReturn: false,
    onClose: () => console.log('Modal closed'),
    onBorrow: () => {
      console.log('Book borrowed');
      alert('Book borrowed successfully!');
    },
  },
};

export const BorrowedBookCanReturn: Story = {
  args: {
    book: sampleBookBorrowed,
    isOpen: true,
    canBorrow: false,
    canReturn: true,
    onClose: () => console.log('Modal closed'),
    onReturn: () => {
      console.log('Book returned');
      alert('Book returned successfully!');
    },
  },
};

export const MaintenanceBook: Story = {
  args: {
    book: sampleBookMaintenance,
    isOpen: true,
    canBorrow: false,
    canReturn: false,
    onClose: () => console.log('Modal closed'),
  },
};

export const ViewOnlyMode: Story = {
  args: {
    book: sampleBookAvailable,
    isOpen: true,
    canBorrow: false,
    canReturn: false,
    onClose: () => console.log('Modal closed'),
  },
};

export const LongTitleAndAuthor: Story = {
  args: {
    book: {
      ...sampleBookAvailable,
      title: 'A Very Long Book Title That Demonstrates How The Modal Handles Extended Text Content and Layout',
      author: 'An Author With A Very Long Name That Tests Modal Layout and Text Wrapping',
      category: 'Science Fiction and Fantasy with Multiple Genres Combined',
    },
    isOpen: true,
    canBorrow: true,
    onClose: () => console.log('Modal closed'),
    onBorrow: () => alert('Long title book borrowed!'),
  },
};

export const NullBook: Story = {
  args: {
    book: null,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};