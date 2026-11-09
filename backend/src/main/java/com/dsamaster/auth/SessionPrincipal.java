package com.dsamaster.auth;

import java.io.Serial;
import java.io.Serializable;
import java.security.Principal;

/**
 * Principal for sessions created by our own login endpoints (email/password
 * and the development login). OAuth logins use {@link AppOAuth2User} /
 * {@link AppOidcUser} instead.
 */
public record SessionPrincipal(long userId) implements AppPrincipal, Principal, Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	/** Session index name; lets us find and revoke a user's sessions. */
	public static String nameFor(long userId) {
		return "user:" + userId;
	}

	@Override
	public long getUserId() {
		return userId;
	}

	@Override
	public String getName() {
		return nameFor(userId);
	}
}
