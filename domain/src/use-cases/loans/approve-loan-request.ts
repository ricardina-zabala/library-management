import type { LoanRequestService, BookService, UserService, EmailService } from '../../services/index.js';
import type { LoanRequest } from '../../entities/index.js';
import { LoanRequestStatus } from '../../entities/index.js';

export interface ApproveLoanRequestDeps {
  loanRequestService: LoanRequestService;
  bookService: BookService;
  userService: UserService;
  emailService: EmailService;
}

export interface ApproveLoanRequestPayload {
  token: string;
  reviewedBy: string;
  dueDate?: string;
}

export interface ApproveLoanRequestResult {
  success: boolean;
  message: string;
  loanRequest?: LoanRequest;
}

export async function approveLoanRequest(
  deps: ApproveLoanRequestDeps,
  payload: ApproveLoanRequestPayload
): Promise<ApproveLoanRequestResult> {
  try {
    if (!payload.token || !payload.reviewedBy) {
      return {
        success: false,
        message: 'Token y bibliotecario son requeridos'
      };
    }

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

    const book = await deps.bookService.findById(loanRequest.bookId);
    if (!book || book.availableCopies <= 0) {
      return {
        success: false,
        message: 'El libro ya no está disponible'
      };
    }

    const user = await deps.userService.findById(loanRequest.userId);
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    const dueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const approvedRequest = await deps.loanRequestService.approve(
      loanRequest.id,
      payload.reviewedBy,
      dueDate
    );

    if (!approvedRequest) {
      return {
        success: false,
        message: 'Error al aprobar la solicitud'
      };
    }

    const emailSent = await deps.emailService.sendLoanApprovalEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      book.title
    );

    if (!emailSent) {
      console.warn('No se pudo enviar el email de confirmación de aprobación');
    }

    await deps.bookService.updateAvailableCopies(book.id, -1);

    return {
      success: true,
      message: 'Solicitud aprobada exitosamente',
      loanRequest: approvedRequest
    };

  } catch (error) {
    console.error('Error in approveLoanRequest:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}