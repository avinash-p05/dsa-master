package com.dsamaster.common;

import org.springframework.http.HttpStatus;

/**
 * An error with an HTTP status and a stable machine-readable {@code code}
 * (sent in the problem+json body) that the SPA can branch on.
 */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String code;

	public ApiException(HttpStatus status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public HttpStatus getStatus() { return status; }
	public String getCode() { return code; }
}
