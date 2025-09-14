import type { LoanRequestService, BookService, UserService, EmailService } from '../../services/index.js';
import type { LoanRequest } from '../../entities/index.js';
import { LoanRequestStatus } from '../../entities/index.js';

export interface RejectLoanRequestDeps {
  loanRequestService: LoanRequestService;
  bookService: BookService;
  userService: UserService;
  emailService: EmailService;
}

export interface RejectLoanRequestPayload {
  token: string;
  reviewedBy: string;
  reason?: string;
}

export interface RejectLoanRequestResult {
  success: boolean;
  message: string;
  loanRequest?: LoanRequest;
}

export async function rejectLoanRequest(
  deps: RejectLoanRequestDeps,
  payload: RejectLoanRequestPayload
): Promise<RejectLoanRequestResult> {
  try {
    if (!payload.token || !payload.reviewedBy) {
      return {
        success: false,
        message: 'Token y bibliotecario son requeridos'
      };
    }

    // Buscar la solicitud por token
    const loanRequest = await deps.loanRequestService.findByToken(payload.token);
    if (!loanRequest) {
      return {
        success: false,
        message: 'Solicitud no encontrada o token inválido'
      };
    }

    if (loanRequest.status !== LoanRequestStatus.PENDING) {
      return {
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      };
    }

    // Obtener información del libro y usuario para el email
    const book = await deps.bookService.findById(loanRequest.bookId);
    const user = await deps.userService.findById(loanRequest.userId);

    if (!book || !user) {
      return {
        success: false,
        message: 'No se pudo encontrar información del libro o usuario'
      };
    }

    // Rechazar la solicitud
    const rejectedRequest = await deps.loanRequestService.reject(
      loanRequest.id,
      payload.reviewedBy,
      payload.reason
    );

    if (!rejectedRequest) {
      return {
        success: false,
        message: 'Error al rechazar la solicitud'
      };
    }

    // Enviar email de rechazo al usuario
    const emailSent = await deps.emailService.sendLoanRejectionEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      book.title,
      payload.reason
    );

    if (!emailSent) {
      console.warn('No se pudo enviar el email de rechazo');
    }

    return {
      success: true,
      message: 'Solicitud rechazada exitosamente',
      loanRequest: rejectedRequest
    };

  } catch (error) {
    console.error('Error in rejectLoanRequest:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}