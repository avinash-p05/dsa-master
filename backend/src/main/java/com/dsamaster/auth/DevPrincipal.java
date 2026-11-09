package com.dsamaster.auth;

import java.io.Serial;
import java.io.Serializable;
import java.security.Principal;

/** Principal used by the development-only login. */
public record DevPrincipal(long userId) implements AppPrincipal, Principal, Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	@Override
	public long getUserId() {
		return userId;
	}

	@Override
	public String getName() {
		return "dev:" + userId;
	}
}
