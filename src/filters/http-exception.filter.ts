import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const resposne = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Check if the exception response is a validation error
    const errors = exceptionResponse?.errors;

    resposne.status(status).send({
      status,
      name: exception.name,
      message: exceptionResponse.message,
      errors,
    });
  }
}
