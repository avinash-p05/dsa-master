package com.dsamaster.auth;

import java.io.Serial;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

/** OpenID Connect user (Google) carrying our internal user id. */
public class AppOidcUser extends DefaultOidcUser implements AppPrincipal {

	@Serial
	private static final long serialVersionUID = 1L;

	private final long userId;

	public AppOidcUser(long userId, Collection<? extends GrantedAuthority> authorities,
			OidcIdToken idToken, OidcUserInfo userInfo) {
		super(authorities, idToken, userInfo, "sub");
		this.userId = userId;
	}

	@Override
	public long getUserId() {
		return userId;
	}
}
