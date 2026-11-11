import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiFieldError = {
  field: string;
  message: string;
};

export function successBody<T>(message: string, data: T, meta: Record<string, unknown> = {}) {
  return {
    success: true as const,
    message,
    data,
    meta,
  };
}

export function errorBody(message: string, errors: ApiFieldError[] = []) {
  return {
    success: false as const,
    message,
    errors,
  };
}

export function apiSuccess<T>(
  message: string,
  data: T,
  meta: Record<string, unknown> = {},
  status = 200,
) {
  return NextResponse.json(successBody(message, data, meta), { status });
}

export function rethrowIfPrerender(error: unknown) {
  if (
    error instanceof Error &&
    /prerender|dynamic server usage|connection\(\)/i.test(error.message)
  ) {
    throw error;
  }
}

export function apiError(message: string, status: number, errors: ApiFieldError[] = []) {
  return NextResponse.json(errorBody(message, errors), { status });
}

export function zodErrorResponse(error: ZodError, message = "Check the request and try again.") {
  return apiError(
    message,
    400,
    error.issues.map((issue) => ({
      field: issue.path.join(".") || "request",
      message: issue.message,
    })),
  );
}
