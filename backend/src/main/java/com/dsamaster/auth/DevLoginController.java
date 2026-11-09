package com.dsamaster.auth;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.dsamaster.auth.dto.UserResponse;
import com.dsamaster.user.AppUser;
import com.dsamaster.user.AppUserService;
import com.dsamaster.user.OAuthProfile;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
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
	private final SecurityContextRepository contextRepository;

	public DevLoginController(AppUserService users, SecurityContextRepository contextRepository) {
		this.users = users;
		this.contextRepository = contextRepository;
	}

	@PostMapping("/login")
	public UserResponse login(HttpServletRequest request, HttpServletResponse response) {
		AppUser user = users.upsert(new OAuthProfile("dev", "dev-user", "dev@localhost", "Dev User", null));

		var auth = UsernamePasswordAuthenticationToken.authenticated(
				new DevPrincipal(user.getId()), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(auth);
		SecurityContextHolder.setContext(context);

		// Prevent session fixation, then persist the login in the session.
		if (request.getSession(false) != null) request.changeSessionId();
		contextRepository.saveContext(context, request, response);
		return UserResponse.from(user);
	}
}
