import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../components/modal.js';

interface LoanRequestDetails {
  loanRequest: {
    id: string;
    userId: string;
    bookId: string;
    status: string;
    requestDate: string;
    token: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publishedYear: number;
    availableCopies: number;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Helper function to safely get date string in YYYY-MM-DD format
const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0] || '';
};

export default function LibrarianLoanManagement() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState<LoanRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token inválido');
      setLoading(false);
      return;
    }

    fetchLoanDetails();
  }, [token]);

  const fetchLoanDetails = async () => {
    try {
      const response = await fetch('/getLoanRequestByToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result: ApiResponse<LoanRequestDetails> = await response.json();

      if (!result.success || !result.data) {
        setError(result.message || 'Error al cargar la solicitud');
        setLoading(false);
        return;
      }

      setLoanDetails(result.data);
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 15);
      setDueDate(getDateString(defaultDueDate));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching loan details:', err);
      setError('Error de conexión');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!token || !dueDate) {
      alert('Por favor, selecciona una fecha límite');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/approveLoanRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          reviewedBy: 'librarian', // En una implementación real, esto vendría del usuario autenticado
          dueDate,
        }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        setActionCompleted(true);
        alert('Solicitud aprobada exitosamente. Se ha enviado un email de confirmación al usuario.');
      } else {
        alert(result.message || 'Error al aprobar la solicitud');
      }
    } catch (err) {
      console.error('Error approving loan:', err);
      alert('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setProcessing(true);
    try {
      const response = await fetch('/rejectLoanRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          reviewedBy: 'librarian', // En una implementación real, esto vendría del usuario autenticado
          reason: rejectionReason || 'No se especificó razón',
        }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        setActionCompleted(true);
        setShowRejectModal(false);
        alert('Solicitud rechazada. Se ha enviado un email de notificación al usuario.');
      } else {
        alert(result.message || 'Error al rechazar la solicitud');
      }
    } catch (err) {
      console.error('Error rejecting loan:', err);
      alert('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !loanDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (actionCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitud Procesada</h1>
            <p className="text-gray-600 mb-6">
              La solicitud ha sido procesada exitosamente y se ha notificado al usuario.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loanDetails.loanRequest.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitud ya procesada</h1>
            <p className="text-gray-600 mb-6">
              Esta solicitud ya ha sido {loanDetails.loanRequest.status === 'approved' ? 'aprobada' : 'rechazada'}.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitud de Préstamo</h1>
            <p className="text-gray-600 mt-1">Revisar y procesar solicitud de préstamo</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Usuario */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">👤 Información del Usuario</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nombre:</span> {loanDetails.user.firstName} {loanDetails.user.lastName}</p>
                  <p><span className="font-medium">Email:</span> {loanDetails.user.email}</p>
                  <p><span className="font-medium">ID:</span> {loanDetails.user.id}</p>
                </div>
              </div>

              {/* Información del Libro */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">📚 Información del Libro</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Título:</span> {loanDetails.book.title}</p>
                  <p><span className="font-medium">Autor:</span> {loanDetails.book.author}</p>
                  <p><span className="font-medium">ISBN:</span> {loanDetails.book.isbn}</p>
                  <p><span className="font-medium">Categoría:</span> {loanDetails.book.category}</p>
                  <p><span className="font-medium">Año:</span> {loanDetails.book.publishedYear}</p>
                  <p><span className="font-medium">Copias disponibles:</span> {loanDetails.book.availableCopies}</p>
                </div>
              </div>

              {/* Información de la Solicitud */}
              <div className="bg-yellow-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">📋 Detalles de la Solicitud</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <p><span className="font-medium">Fecha de solicitud:</span><br/>
                    {new Date(loanDetails.loanRequest.requestDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p><span className="font-medium">Estado:</span><br/>
                    <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      Pendiente
                    </span>
                  </p>
                  <p><span className="font-medium">ID de solicitud:</span><br/>{loanDetails.loanRequest.id}</p>
                </div>
              </div>
            </div>

            {/* Panel de Decisión */}
            {loanDetails.book.availableCopies > 0 ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Procesar Solicitud</h3>
                
                <div className="mb-6">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha límite de devolución
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={getDateString(new Date())}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={processing || !dueDate}
                    className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>✅ Aprobar Solicitud</>
                    )}
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    ❌ Rechazar Solicitud
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Libro no disponible</h3>
                <p className="text-red-700 mb-4">
                  No hay copias disponibles de este libro. Solo puedes rechazar esta solicitud.
                </p>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  ❌ Rechazar Solicitud
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Rechazo */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rechazar Solicitud">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechazar Solicitud</h3>
          <p className="text-gray-600 mb-4">
            ¿Estás seguro de que quieres rechazar esta solicitud? Esta acción no se puede deshacer.
          </p>
          
          <div className="mb-4">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
              Razón del rechazo (opcional)
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explica por qué se rechaza la solicitud..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              disabled={processing}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {processing ? 'Procesando...' : 'Confirmar Rechazo'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}