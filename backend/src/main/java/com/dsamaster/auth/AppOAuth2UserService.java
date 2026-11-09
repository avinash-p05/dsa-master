package com.dsamaster.auth;

import java.util.Map;

import com.dsamaster.user.AppUser;
import com.dsamaster.user.AppUserService;
import com.dsamaster.user.OAuthProfile;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** Loads the GitHub profile and links it to an {@link AppUser}. */
@Service
public class AppOAuth2UserService extends DefaultOAuth2UserService {

	private final AppUserService users;

	public AppOAuth2UserService(AppUserService users) {
		this.users = users;
	}

	@Override
	public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
		OAuth2User oauthUser = super.loadUser(request);
		String provider = request.getClientRegistration().getRegistrationId();
		Map<String, Object> attrs = oauthUser.getAttributes();

		String login = asString(attrs.get("login"));
		String name = asString(attrs.get("name"));
		OAuthProfile profile = new OAuthProfile(
				provider,
				asString(attrs.get("id")),
				asString(attrs.get("email")),
				StringUtils.hasText(name) ? name : login,
				asString(attrs.get("avatar_url")));

		AppUser user = users.upsert(profile);
		String nameAttributeKey = request.getClientRegistration()
				.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
		return new AppOAuth2User(user.getId(), oauthUser.getAuthorities(), attrs, nameAttributeKey);
	}

	private static String asString(Object value) {
		return value == null ? null : String.valueOf(value);
	}
}
