package com.dsamaster.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.dsamaster.auth.dto.UserResponse;
import com.dsamaster.user.AppUser;
import com.dsamaster.user.AppUserService;
import com.dsamaster.user.OAuthProfile;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Development-only sign-in ("Continue as dev user"), so the full flow can be
 * tested locally without OAuth credentials. Never enabled in the prod profile.
 */
@RestController
@RequestMapping("/api/dev")
@ConditionalOnProperty(name = "app.dev-login-enabled", havingValue = "true")
public class DevLoginController {

	private final AppUserService users;
	private final SessionLoginService sessions;

	public DevLoginController(AppUserService users, SessionLoginService sessions) {
		this.users = users;
		this.sessions = sessions;
	}

	@PostMapping("/login")
	public UserResponse login(HttpServletRequest request, HttpServletResponse response) {
		AppUser user = users.upsert(new OAuthProfile("dev", "dev-user", "dev@localhost", "Dev User", null));
		sessions.logIn(user.getId(), request, response);
		return UserResponse.from(user);
	}
}
