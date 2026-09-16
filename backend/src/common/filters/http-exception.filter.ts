import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Erro interno no servidor.';
    let errorDetail: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorDetail = (res as any).error || null;
      } else {
        message = res;
      }
    } else if ((exception as any)?.code === '23505') {
      // Erro de restrição UNIQUE do PostgreSQL
      status = HttpStatus.CONFLICT;
      message = 'Registro duplicado: Violação de restrição única no banco de dados.';
      errorDetail = (exception as any).detail;
    } else if ((exception as any)?.code === '23503') {
      // Erro de Foreign Key do PostgreSQL
      status = HttpStatus.BAD_REQUEST;
      message = 'Violação de integridade referencial: Registro relacionado não encontrado.';
      errorDetail = (exception as any).detail;
    } else {
      this.logger.error('Unhandled Exception:', exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: errorDetail,
    });
  }
}
