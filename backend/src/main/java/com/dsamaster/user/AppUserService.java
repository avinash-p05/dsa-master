package com.dsamaster.user;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppUserService {

	private final AppUserRepository users;
	private final Clock clock;

	public AppUserService(AppUserRepository users, Clock clock) {
		this.users = users;
		this.clock = clock;
	}

	/**
	 * Create the user on first login, or refresh their profile on later logins.
	 * Accounts are keyed by (provider, provider user id): signing in with GitHub
	 * and Google gives two separate accounts, which avoids account takeover via
	 * unverified emails.
	 */
	@Transactional
	public AppUser upsert(OAuthProfile profile) {
		Instant now = Instant.now(clock);
		AppUser user = users.findByProviderAndProviderUserId(profile.provider(), profile.providerUserId())
				.orElseGet(() -> new AppUser(profile.provider(), profile.providerUserId(), now));
		user.updateProfile(profile, now);
		return users.save(user);
	}

	@Transactional(readOnly = true)
	public Optional<AppUser> findById(long id) {
		return users.findById(id);
	}
}
