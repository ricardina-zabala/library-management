import { useState, useEffect } from 'react';
import type { Book } from 'app-domain';

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
}

interface BookFormProps {
  book?: Book;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export const BookForm: React.FC<BookFormProps> = ({
  book,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = 'Guardar'
}) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookFormData, string>>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publishedYear: book.publishedYear,
        totalCopies: book.totalCopies
      });
    }
  }, [book]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'El autor es requerido';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'El ISBN es requerido';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.publishedYear < 1000 || formData.publishedYear > new Date().getFullYear()) {
      newErrors.publishedYear = 'Año de publicación inválido';
    }

    if (formData.totalCopies < 1) {
      newErrors.totalCopies = 'Debe haber al menos 1 copia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof BookFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título
          <span className='text-red-500'> *</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingresa el título del libro"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
          Autor
          <span className='text-red-500'> *</span>
        </label>
        <input
          type="text"
          id="author"
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.author ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingresa el autor del libro"
        />
        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
      </div>

      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
          ISBN
          <span className='text-red-500'> *</span>
        </label>
        <input
          type="text"
          id="isbn"
          value={formData.isbn}
          onChange={(e) => handleChange('isbn', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.isbn ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingresa el ISBN del libro"
          disabled={!!book}
        />
        {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
        {book && <p className="text-gray-500 text-sm mt-1">El ISBN no se puede modificar</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
          <span className='text-red-500'> *</span>
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Ficción, Historia, Ciencia"
        />
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-1">
            Año de Publicación 
            
          </label>
          <input
            type="number"
            id="publishedYear"
            value={formData.publishedYear}
            onChange={(e) => handleChange('publishedYear', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.publishedYear ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1000"
            max={new Date().getFullYear()}
          />
          {errors.publishedYear && <p className=" text-sm mt-1">{errors.publishedYear}</p>}
        </div>

        <div>
          <label htmlFor="totalCopies" className="block text-sm font-medium text-gray-700 mb-1">
            Total de Copias
            <span className='text-red-500'> *</span>
          </label>
          <input
            type="number"
            id="totalCopies"
            value={formData.totalCopies}
            onChange={(e) => handleChange('totalCopies', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.totalCopies ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1"
          />
          {errors.totalCopies && <p className="text-red-500 text-sm mt-1">{errors.totalCopies}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};
