package com.dsamaster.auth;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;

/** Starts and revokes sessions for logins we handle ourselves (not OAuth). */
@Service
public class SessionLoginService {

	private final SecurityContextRepository contextRepository;
	private final FindByIndexNameSessionRepository<? extends Session> sessions;

	public SessionLoginService(SecurityContextRepository contextRepository,
			FindByIndexNameSessionRepository<? extends Session> sessions) {
		this.contextRepository = contextRepository;
		this.sessions = sessions;
	}

	public void logIn(long userId, HttpServletRequest request, HttpServletResponse response) {
		var auth = UsernamePasswordAuthenticationToken.authenticated(
				new SessionPrincipal(userId), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(auth);
		SecurityContextHolder.setContext(context);

		// Always start a fresh session on login (prevents session fixation, and is
		// safe even if the old session was just revoked), then persist the login.
		HttpSession existing = request.getSession(false);
		if (existing != null) existing.invalidate();
		request.getSession(true);
		contextRepository.saveContext(context, request, response);
	}

	/** Sign the user out everywhere (e.g. after a password reset). */
	public void revokeAllSessions(long userId) {
		sessions.findByPrincipalName(SessionPrincipal.nameFor(userId)).keySet().forEach(sessions::deleteById);
	}
}
