package com.gofleet.exception;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> conflict(ConflictException ex, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, ex.getMessage(), request, null);
    }

    @ExceptionHandler({BusinessException.class, PaiementException.class})
    public ResponseEntity<ApiErrorResponse> badRequest(RuntimeException ex, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(field -> field.getField() + ": " + field.getDefaultMessage())
                .toList();
        return error(HttpStatus.BAD_REQUEST, "Validation invalide", request, details);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> credentials(BadCredentialsException ex, HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "Identifiants invalides", request, null);
    }

    @ExceptionHandler({JwtException.class, SecurityException.class})
    public ResponseEntity<ApiErrorResponse> jwt(RuntimeException ex, HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "Token invalide", request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> forbidden(AccessDeniedException ex, HttpServletRequest request) {
        return error(HttpStatus.FORBIDDEN, "Acces interdit", request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> generic(Exception ex, HttpServletRequest request) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request, null);
    }

    private ResponseEntity<ApiErrorResponse> error(HttpStatus status, String message, HttpServletRequest request, List<String> details) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.name(),
                message,
                request.getRequestURI(),
                details
        ));
    }
}
