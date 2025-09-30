import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Handles errors thrown inside services.
 * - Known NestJS HTTP exceptions are re-thrown as-is.
 * - Unknown errors are wrapped in a generic InternalServerErrorException.
 *
 * @param error - The error caught inside catch()
 * @param fallbackMessage - Message to use if error is unknown
 */
export function handleServiceError(error: any, fallbackMessage: string) {
    if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
    ) {
        throw error; // ✅ Re-throw known HTTP exceptions untouched
    }

    // ✅ Handle unexpected errors
    throw new InternalServerErrorException(fallbackMessage);
}
