package com.dsamaster.common;

/** Client sent something we can't accept; mapped to HTTP 400. */
public class BadRequestException extends RuntimeException {

	public BadRequestException(String message) {
		super(message);
	}
}
