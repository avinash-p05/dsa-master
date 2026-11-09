package com.dsamaster.auth.local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request bodies for the email/password endpoints. */
public final class AuthRequests {

	public static final int MIN_PASSWORD = 8;
	public static final int MAX_PASSWORD = 128;

	private AuthRequests() {
	}

	public record Register(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(min = MIN_PASSWORD, max = MAX_PASSWORD, message = "Password must be 8–128 characters") String password,
			@Size(max = 100) String name) {
	}

	public record Login(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(max = MAX_PASSWORD) String password) {
	}

	public record EmailOnly(@NotBlank @Email @Size(max = 254) String email) {
	}

	public record Token(@NotBlank @Size(max = 100) String token) {
	}

	public record ResetPassword(
			@NotBlank @Size(max = 100) String token,
			@NotBlank @Size(min = MIN_PASSWORD, max = MAX_PASSWORD, message = "Password must be 8–128 characters") String password) {
	}

	public record Message(String message) {
	}
}
