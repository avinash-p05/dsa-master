package com.dsamaster.auth.local;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import com.dsamaster.auth.SessionLoginService;
import com.dsamaster.auth.dto.UserResponse;
import com.dsamaster.auth.local.dto.AuthRequests;
import com.dsamaster.user.AppUser;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Email/password sign-up, sign-in, verification and password reset. */
@RestController
@RequestMapping("/api/auth")
@ConditionalOnProperty(name = "app.auth.password-login-enabled", havingValue = "true", matchIfMissing = true)
public class LocalAuthController {

	private static final AuthRequests.Message CHECK_EMAIL = new AuthRequests.Message(
			"If that address can receive email, a message is on its way. Check your inbox (and spam folder).");

	private final LocalAuthService auth;
	private final SessionLoginService sessions;

	public LocalAuthController(LocalAuthService auth, SessionLoginService sessions) {
		this.auth = auth;
		this.sessions = sessions;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.ACCEPTED)
	public AuthRequests.Message register(@Valid @RequestBody AuthRequests.Register body, HttpServletRequest request) {
		auth.register(body, request.getRemoteAddr());
		return CHECK_EMAIL;
	}

	@PostMapping("/login")
	public UserResponse login(@Valid @RequestBody AuthRequests.Login body, HttpServletRequest request,
			HttpServletResponse response) {
		AppUser user = auth.login(body, request.getRemoteAddr());
		sessions.logIn(user.getId(), request, response);
		return UserResponse.from(user);
	}

	/** Opening the emailed link verifies the address and signs the user in. */
	@PostMapping("/verify-email")
	public UserResponse verifyEmail(@Valid @RequestBody AuthRequests.Token body, HttpServletRequest request,
			HttpServletResponse response) {
		AppUser user = auth.verifyEmail(body.token());
		sessions.logIn(user.getId(), request, response);
		return UserResponse.from(user);
	}

	@PostMapping("/resend-verification")
	@ResponseStatus(HttpStatus.ACCEPTED)
	public AuthRequests.Message resendVerification(@Valid @RequestBody AuthRequests.EmailOnly body,
			HttpServletRequest request) {
		auth.resendVerification(body.email(), request.getRemoteAddr());
		return CHECK_EMAIL;
	}

	@PostMapping("/forgot-password")
	@ResponseStatus(HttpStatus.ACCEPTED)
	public AuthRequests.Message forgotPassword(@Valid @RequestBody AuthRequests.EmailOnly body,
			HttpServletRequest request) {
		auth.forgotPassword(body.email(), request.getRemoteAddr());
		return CHECK_EMAIL;
	}

	@PostMapping("/reset-password")
	public UserResponse resetPassword(@Valid @RequestBody AuthRequests.ResetPassword body, HttpServletRequest request,
			HttpServletResponse response) {
		AppUser user = auth.resetPassword(body);
		sessions.logIn(user.getId(), request, response);
		return UserResponse.from(user);
	}
}
