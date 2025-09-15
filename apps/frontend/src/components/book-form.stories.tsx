import type { Meta, StoryObj } from '@storybook/react';
import { BookForm, type BookFormData } from './book-form.js';
import { BookStatus } from 'app-domain';

const meta: Meta<typeof BookForm> = {
  title: 'Components/BookForm',
  component: BookForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockBook = {
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

export const CreateNew: Story = {
  args: {
    onSubmit: (data: BookFormData) => {
      console.log('Form submitted with data:', data);
      alert(`Book created: ${data.title} by ${data.author}`);
    },
    onCancel: () => {
      console.log('Form cancelled');
      alert('Form cancelled');
    },
    submitText: 'Crear Libro',
    isLoading: false,
  },
};

export const EditExisting: Story = {
  args: {
    ...CreateNew.args,
    book: mockBook,
    submitText: 'Actualizar Libro',
    onSubmit: (data: BookFormData) => {
      console.log('Form submitted with data:', data);
      alert(`Book updated: ${data.title} by ${data.author}`);
    },
  },
};

export const LoadingState: Story = {
  args: {
    ...CreateNew.args,
    isLoading: true,
    submitText: 'Guardando...',
  },
};

export const EditWithDisabledISBN: Story = {
  args: {
    ...EditExisting.args,
    book: {
      ...mockBook,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      category: 'Classic Literature',
      publishedYear: 1960,
    },
  },
};

export const LongContent: Story = {
  args: {
    ...CreateNew.args,
    book: {
      ...mockBook,
      title: 'A Very Long Title That Demonstrates How The Form Handles Extended Text Content',
      author: 'An Author With A Very Long Name That Tests Form Layout',
      category: 'Science Fiction and Fantasy with Multiple Genres',
    },
  },
};