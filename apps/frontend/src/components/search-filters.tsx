import { useState } from 'react';
import { BookStatus } from 'app-domain';

export interface SearchFiltersProps {
  onSearch?: (query: string) => void;
  onFilterByStatus?: (status: BookStatus | 'all') => void;
  onFilterByCategory?: (category: string) => void;
  categories?: string[];
  placeholder?: string;
}

export const SearchFilters = ({
  onSearch,
  onFilterByStatus,
  onFilterByCategory,
  categories = [],
  placeholder = "Buscar libros por título, autor o ISBN..."
}: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as BookStatus | 'all';
    setSelectedStatus(status);
    onFilterByStatus?.(status);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilterByCategory?.(category);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    onSearch?.('');
    onFilterByStatus?.('all');
    onFilterByCategory?.('all');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value={BookStatus.AVAILABLE}>Disponible</option>
            <option value={BookStatus.BORROWED}>Prestado</option>
            <option value={BookStatus.RESERVED}>Reservado</option>
            <option value={BookStatus.MAINTENANCE}>Mantenimiento</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all') && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 rounded-lg hover:bg-primary-200 border border-primary-200 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};