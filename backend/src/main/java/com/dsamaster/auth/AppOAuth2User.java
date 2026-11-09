package com.dsamaster.auth;

import java.io.Serial;
import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

/** Plain OAuth2 user (GitHub) carrying our internal user id. */
public class AppOAuth2User extends DefaultOAuth2User implements AppPrincipal {

	@Serial
	private static final long serialVersionUID = 1L;

	private final long userId;

	public AppOAuth2User(long userId, Collection<? extends GrantedAuthority> authorities,
			Map<String, Object> attributes, String nameAttributeKey) {
		super(authorities, attributes, nameAttributeKey);
		this.userId = userId;
	}

	@Override
	public long getUserId() {
		return userId;
	}
}
