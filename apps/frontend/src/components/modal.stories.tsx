import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal.js';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: (
      <div>
        <p className="text-gray-600 mb-4">
          This is the modal content. You can put any React component or HTML here.
        </p>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>
    ),
    onClose: () => alert('Modal closed'),
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    title: 'Small Modal',
    children: (
      <div>
        <p className="text-gray-600">This is a small modal.</p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    title: 'Large Modal',
    children: (
      <div>
        <h4 className="text-md font-semibold mb-2">Large Modal Content</h4>
        <p className="text-gray-600 mb-4">
          This is a large modal with more content. It can contain forms, lists, or any other components.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded">
            <h5 className="font-medium">Section 1</h5>
            <p className="text-sm text-gray-600">Some content here</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h5 className="font-medium">Section 2</h5>
            <p className="text-sm text-gray-600">More content here</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    ...Default.args,
    title: 'Form Modal',
    children: (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    ),
  },
};