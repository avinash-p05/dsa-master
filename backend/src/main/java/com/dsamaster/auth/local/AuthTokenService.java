package com.dsamaster.auth.local;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthTokenService {

	private static final SecureRandom RANDOM = new SecureRandom();

	private final AuthTokenRepository tokens;
	private final Clock clock;

	public AuthTokenService(AuthTokenRepository tokens, Clock clock) {
		this.tokens = tokens;
		this.clock = clock;
	}

	/** Issue a new token (invalidating earlier ones of the same purpose) and return the raw value for the link. */
	@Transactional
	public String issue(long userId, TokenPurpose purpose, Duration ttl) {
		Instant now = Instant.now(clock);
		tokens.invalidateAll(userId, purpose, now);

		byte[] bytes = new byte[32];
		RANDOM.nextBytes(bytes);
		String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
		tokens.save(new AuthToken(userId, purpose, hash(raw), now.plus(ttl), now));
		return raw;
	}

	/** Use a token once. Returns the user id if the token is valid, unexpired and unused. */
	@Transactional
	public Optional<Long> consume(String raw, TokenPurpose purpose) {
		if (raw == null || raw.isBlank() || raw.length() > 100) return Optional.empty();
		Instant now = Instant.now(clock);
		return tokens.findByTokenHashAndPurpose(hash(raw), purpose)
				.filter(t -> t.isUsable(now))
				.map(t -> {
					t.markUsed(now);
					return t.getUserId();
				});
	}

	@Scheduled(cron = "0 17 3 * * *")
	@Transactional
	public void purgeExpired() {
		tokens.deleteExpiredBefore(Instant.now(clock).minus(Duration.ofDays(7)));
	}

	private static String hash(String raw) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
