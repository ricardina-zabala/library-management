import { useEffect, useState } from 'react';
import type { Book } from 'app-domain';
import { BookStatus, UserRole } from 'app-domain';
import { useBooks } from '../hooks/useBooks.js';
import { useAuth } from '../hooks/useAuth.js';
import { Modal } from '../components/modal.js';
import { BookForm, type BookFormData } from '../components/book-form.js';

export const AdminBooksPage = () => {
  const { books, loading, error, searchBooks, createBook, updateBook, deleteBook } = useBooks();
  const { user } = useAuth();
  
  // Mapear rol del usuario al formato esperado por el backend
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    searchBooks();
  }, [searchBooks]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [books, searchQuery]);

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
      } else {
        console.log(response.error || 'Error al crear el libro');
      }
    } catch (error) {
      console.log("Error al crear el libro", error)
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
        alert('Libro actualizado exitosamente');
      } else {
        alert(response.error || 'Error al actualizar el libro');
      }
    } catch (error) {
      alert('Error al actualizar el libro');
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
        alert('Libro eliminado exitosamente');
      } else {
        alert(response.error || 'Error al eliminar el libro');
      }
    } catch (error) {
      alert('Error al eliminar el libro');
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administración de Libros</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Libro
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título, autor, ISBN o categoría..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'No se encontraron libros que coincidan con tu búsqueda' : 'No hay libros disponibles'}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.status === BookStatus.AVAILABLE 
                          ? 'bg-green-100 text-green-800'
                          : book.status === BookStatus.BORROWED
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.status === BookStatus.AVAILABLE ? 'Disponible' : 
                         book.status === BookStatus.BORROWED ? 'Prestado' : 
                         book.status}
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
      )}

      {/* Create Book Modal */}
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

      {/* Edit Book Modal */}
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

      {/* Delete Confirmation Modal */}
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