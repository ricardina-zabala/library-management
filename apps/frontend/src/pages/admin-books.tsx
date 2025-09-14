import { useEffect, useState } from 'react';
import type { Book } from 'app-domain';
import { BookStatus, UserRole } from 'app-domain';
import { useBooks } from '../hooks/useBooks.js';
import { useAuth } from '../hooks/useAuth.js';
import { Modal } from '../components/modal.js';
import { BookForm, type BookFormData } from '../components/book-form.js';
import { SearchFilters } from '../components/search-filters.js';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

export const AdminBooksPage = () => {
  const { books, loading, error, searchBooks, createBook, updateBook, deleteBook } = useBooks();
  const { user } = useAuth();

  const mapUserRole = (role: string): UserRole => {
    switch (role) {
      case 'admin':
        return UserRole.ADMIN;
      case 'librarian':
        return UserRole.LIBRARIAN;
      default:
        return UserRole.MEMBER;
    }
  };

  const mapBookStatus = (status: BookStatus): string => {
    switch (status) {
      case BookStatus.AVAILABLE:
        return 'Disponible';
      case BookStatus.BORROWED:
        return 'Prestado';
      case BookStatus.RESERVED:
        return 'Reservado';
      case BookStatus.MAINTENANCE:
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    searchBooks();
  }, [searchBooks]);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(books.map(book => book.category)));
    setCategories(uniqueCategories);
  }, [books]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchBooks({ query: query.trim() });
    } else {
      searchBooks();
    }
  };

  const handleFilterByStatus = (status: BookStatus | 'all') => {
    if (status === 'all') {
      if (searchQuery.trim()) {
        searchBooks({ query: searchQuery.trim() });
      } else {
        searchBooks();
      }
    } else {
      const searchParams = searchQuery.trim() ? { query: searchQuery.trim(), status } : { status };
      searchBooks(searchParams);
    }
  };

  const handleFilterByCategory = (category: string) => {
    if (category === 'all') {
      if (searchQuery.trim()) {
        searchBooks({ query: searchQuery.trim() });
      } else {
        searchBooks();
      }
    } else {
      const searchParams = searchQuery.trim() ? { query: searchQuery.trim(), category } : { category };
      searchBooks(searchParams);
    }
  };

  const handleCreateBook = async (formData: BookFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await createBook({
        ...formData,
        userRole: mapUserRole(user.role)
      });

      if (response.success) {
        setIsCreateModalOpen(false);
        toast.success('Libro creado exitosamente');
      } else {
        toast.error('Error al crear el libro');
      }
    } catch (error) {
      toast.error('Error al crear el libro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBook = async (formData: BookFormData) => {
    if (!user || !selectedBook) return;

    setIsSubmitting(true);
    try {
      const response = await updateBook({
        bookId: selectedBook.id,
        ...formData,
        userRole: mapUserRole(user.role)
      });

      if (response.success) {
        setIsEditModalOpen(false);
        setSelectedBook(null);
        toast.success('Libro actualizado exitosamente');
      } else {
        toast.error('Error al actualizar el libro');
      }
    } catch (error) {
      toast.error('Error al actualizar el libro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!user || !selectedBook) return;

    setIsSubmitting(true);
    try {
      const response = await deleteBook({
        bookId: selectedBook.id,
        userRole: mapUserRole(user.role)
      });

      if (response.success) {
        setIsDeleteModalOpen(false);
        setSelectedBook(null);
        toast.success('Libro eliminado exitosamente');
      } else {
        toast.error('Error al eliminar el libro');
      }
    } catch (error) {
      toast.error('Error al eliminar el libro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedBook(null);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Administración de Libros</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className='w-5 h-5' />
          Agregar Libro
        </button>
      </div>

      <SearchFilters
        onSearch={handleSearchChange}
        onFilterByStatus={handleFilterByStatus}
        onFilterByCategory={handleFilterByCategory}
        categories={categories}
        placeholder="Buscar libros por título, autor, ISBN o categoría..."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && (
        <>
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Copias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        {searchQuery ? 'No se encontraron libros que coincidan con tu búsqueda' : 'No hay libros disponibles'}
                      </td>
                    </tr>
                  ) : (
                    books.map((book: Book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">{book.author}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.isbn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.publishedYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.availableCopies}/{book.totalCopies}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.status === BookStatus.AVAILABLE
                            ? 'bg-green-100 text-green-800'
                            : book.status === BookStatus.BORROWED
                              ? 'bg-yellow-100 text-yellow-800'
                              : book.status === BookStatus.RESERVED
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {mapBookStatus(book.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(book)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openDeleteModal(book)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {books.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'No se encontraron libros que coincidan con tu búsqueda' : 'No hay libros disponibles'}
                </p>
              </div>
            ) : (
              books.map((book: Book) => (
                <div key={book.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 ${book.status === BookStatus.AVAILABLE
                        ? 'bg-green-100 text-green-800'
                        : book.status === BookStatus.BORROWED
                          ? 'bg-yellow-100 text-yellow-800'
                          : book.status === BookStatus.RESERVED
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {mapBookStatus(book.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ISBN:</span>
                        <p className="text-gray-900">{book.isbn}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Categoría:</span>
                        <p className="text-gray-900">{book.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Año:</span>
                        <p className="text-gray-900">{book.publishedYear}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Copias:</span>
                        <p className="text-gray-900">{book.availableCopies}/{book.totalCopies}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openEditModal(book)}
                        className="px-3 py-2 text-sm text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(book)}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Agregar Nuevo Libro"
        size="lg"
      >
        <BookForm
          onSubmit={handleCreateBook}
          onCancel={closeModals}
          isLoading={isSubmitting}
          submitText="Crear Libro"
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title="Editar Libro"
        size="lg"
      >
        {selectedBook && (
          <BookForm
            book={selectedBook}
            onSubmit={handleEditBook}
            onCancel={closeModals}
            isLoading={isSubmitting}
            submitText="Actualizar Libro"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        title="Confirmar Eliminación"
        size="md"
      >
        {selectedBook && (
          <div>
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar el libro <strong>"{selectedBook.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Autor: {selectedBook.author}<br />
              ISBN: {selectedBook.isbn}<br />
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};