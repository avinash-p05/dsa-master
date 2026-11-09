package com.dsamaster.auth;

import com.dsamaster.user.AppUser;
import com.dsamaster.user.AppUserService;
import com.dsamaster.user.OAuthProfile;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

/** Loads the Google (OpenID Connect) profile and links it to an {@link AppUser}. */
@Service
public class AppOidcUserService extends OidcUserService {

	private final AppUserService users;

	public AppOidcUserService(AppUserService users) {
		this.users = users;
	}

	@Override
	public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
		OidcUser oidcUser = super.loadUser(request);
		OAuthProfile profile = new OAuthProfile(
				request.getClientRegistration().getRegistrationId(),
				oidcUser.getSubject(),
				oidcUser.getEmail(),
				oidcUser.getFullName(),
				oidcUser.getPicture());

		AppUser user = users.upsert(profile);
		return new AppOidcUser(user.getId(), oidcUser.getAuthorities(), oidcUser.getIdToken(), oidcUser.getUserInfo());
	}
}
