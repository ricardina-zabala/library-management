import type { LoanRequestService, BookService, UserService } from '../../services/index.js';
import type { LoanRequest, Book, User } from '../../entities/index.js';
import { LoanRequestStatus } from '../../entities/index.js';

export interface GetLoanRequestByTokenDeps {
  loanRequestService: LoanRequestService;
  bookService: BookService;
  userService: UserService;
}

export interface GetLoanRequestByTokenPayload {
  token: string;
}

export interface LoanRequestDetails {
  loanRequest: LoanRequest;
  book: Book;
  user: User;
}

export interface GetLoanRequestByTokenResult {
  success: boolean;
  message: string;
  data?: LoanRequestDetails;
}

export async function getLoanRequestByToken(
  deps: GetLoanRequestByTokenDeps,
  payload: GetLoanRequestByTokenPayload
): Promise<GetLoanRequestByTokenResult> {
  try {
    if (!payload.token) {
      return {
        success: false,
        message: 'Token es requerido'
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

    // Obtener información del libro
    const book = await deps.bookService.findById(loanRequest.bookId);
    if (!book) {
      return {
        success: false,
        message: 'Libro no encontrado'
      };
    }

    // Obtener información del usuario
    const user = await deps.userService.findById(loanRequest.userId);
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    return {
      success: true,
      message: 'Solicitud encontrada',
      data: {
        loanRequest,
        book,
        user
      }
    };

  } catch (error) {
    console.error('Error in getLoanRequestByToken:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}