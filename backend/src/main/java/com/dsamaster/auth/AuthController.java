package com.dsamaster.auth;

import java.util.ArrayList;
import java.util.List;

import com.dsamaster.auth.dto.SessionResponse;
import com.dsamaster.auth.dto.UserResponse;
import com.dsamaster.config.AppProperties;
import com.dsamaster.user.AppUserService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Session info for the SPA. Login itself happens at
 * {@code /oauth2/authorization/{provider}} and logout at
 * {@code POST /api/auth/logout} (both handled by Spring Security).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AppUserService users;
	private final AppProperties props;

	public AuthController(AppUserService users, AppProperties props) {
		this.users = users;
		this.props = props;
	}

	@GetMapping("/session")
	public SessionResponse session(@AuthenticationPrincipal AppPrincipal principal) {
		List<String> providers = new ArrayList<>(props.oauth().configuredProviders());
		if (props.devLoginEnabled()) providers.add("dev");

		if (principal == null) return new SessionResponse(false, null, providers);
		return users.findById(principal.getUserId())
				.map(user -> new SessionResponse(true, UserResponse.from(user), providers))
				.orElseGet(() -> new SessionResponse(false, null, providers));
	}
}
