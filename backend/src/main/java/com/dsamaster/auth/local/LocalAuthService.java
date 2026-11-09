package com.dsamaster.auth.local;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

import com.dsamaster.auth.SessionLoginService;
import com.dsamaster.auth.local.dto.AuthRequests;
import com.dsamaster.common.ApiException;
import com.dsamaster.common.RateLimiter;
import com.dsamaster.config.AppProperties;
import com.dsamaster.mail.MailService;
import com.dsamaster.user.AppUser;
import com.dsamaster.user.AppUserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Email/password accounts. Responses never reveal whether an email is
 * registered (except at login, after the password is checked).
 */
@Service
public class LocalAuthService {

	private static final Duration MINUTE = Duration.ofMinutes(1);

	private final AppUserRepository users;
	private final AuthTokenService tokens;
	private final PasswordEncoder passwordEncoder;
	private final MailService mail;
	private final SessionLoginService sessions;
	private final RateLimiter rateLimiter;
	private final AppProperties props;
	private final Clock clock;
	/** Compared against when the email is unknown, so login timing doesn't reveal which emails exist. */
	private final String dummyHash;

	public LocalAuthService(AppUserRepository users, AuthTokenService tokens, PasswordEncoder passwordEncoder,
			MailService mail, SessionLoginService sessions, RateLimiter rateLimiter, AppProperties props,
			Clock clock) {
		this.users = users;
		this.tokens = tokens;
		this.passwordEncoder = passwordEncoder;
		this.mail = mail;
		this.sessions = sessions;
		this.rateLimiter = rateLimiter;
		this.props = props;
		this.clock = clock;
		this.dummyHash = passwordEncoder.encode("timing-equaliser-not-a-real-password");
	}

	@Transactional
	public void register(AuthRequests.Register req, String clientIp) {
		String email = normalise(req.email());
		rateLimiter.check("register:ip:" + clientIp, 10, Duration.ofHours(1));
		rateLimiter.check("mail:" + email, 5, Duration.ofHours(1));

		Optional<AppUser> existing = findLocal(email);
		if (existing.isPresent()) {
			AppUser user = existing.get();
			if (user.isEmailVerified()) {
				String reset = link("/reset-password", tokens.issue(user.getId(), TokenPurpose.RESET_PASSWORD,
						props.auth().resetTokenTtl()));
				mail.sendAccountExists(email, user.getDisplayName(), props.baseUrl(), reset);
			} else {
				// Never overwrite the password of an unverified account (that would let
				// someone pre-register a victim's email); just resend the link.
				sendVerification(user);
			}
			return;
		}

		String name = StringUtils.hasText(req.name()) ? req.name().trim() : email.substring(0, email.indexOf('@'));
		AppUser user = users.save(AppUser.local(email, name, passwordEncoder.encode(req.password()), now()));
		sendVerification(user);
	}

	@Transactional
	public AppUser login(AuthRequests.Login req, String clientIp) {
		String email = normalise(req.email());
		rateLimiter.check("login:ip:" + clientIp, 30, MINUTE.multipliedBy(15));
		rateLimiter.check("login:email:" + email, 10, MINUTE.multipliedBy(15));

		Optional<AppUser> found = findLocal(email);
		String hash = found.map(AppUser::getPasswordHash).orElse(dummyHash);
		boolean matches = passwordEncoder.matches(req.password(), hash);
		if (found.isEmpty() || !matches) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Incorrect email or password.");
		}

		AppUser user = found.get();
		if (!user.isEmailVerified()) {
			throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED",
					"Please verify your email first. Check your inbox, or request a new link.");
		}
		user.recordLogin(now());
		return user;
	}

	@Transactional
	public AppUser verifyEmail(String token) {
		AppUser user = tokens.consume(token, TokenPurpose.VERIFY_EMAIL)
				.flatMap(users::findById)
				.orElseThrow(LocalAuthService::invalidLink);
		user.markEmailVerified();
		user.recordLogin(now());
		return user;
	}

	@Transactional
	public void resendVerification(String rawEmail, String clientIp) {
		String email = normalise(rawEmail);
		rateLimiter.check("resend:ip:" + clientIp, 20, Duration.ofHours(1));
		rateLimiter.check("mail:" + email, 5, Duration.ofHours(1));
		findLocal(email).filter(u -> !u.isEmailVerified()).ifPresent(this::sendVerification);
	}

	@Transactional
	public void forgotPassword(String rawEmail, String clientIp) {
		String email = normalise(rawEmail);
		rateLimiter.check("forgot:ip:" + clientIp, 20, Duration.ofHours(1));
		rateLimiter.check("mail:" + email, 5, Duration.ofHours(1));
		findLocal(email).ifPresent(user -> {
			String token = tokens.issue(user.getId(), TokenPurpose.RESET_PASSWORD, props.auth().resetTokenTtl());
			mail.sendPasswordReset(user.getEmail(), user.getDisplayName(), link("/reset-password", token));
		});
	}

	@Transactional
	public AppUser resetPassword(AuthRequests.ResetPassword req) {
		AppUser user = tokens.consume(req.token(), TokenPurpose.RESET_PASSWORD)
				.flatMap(users::findById)
				.orElseThrow(LocalAuthService::invalidLink);
		user.changePassword(passwordEncoder.encode(req.password()));
		user.markEmailVerified(); // they proved they own the inbox
		user.recordLogin(now());
		sessions.revokeAllSessions(user.getId()); // sign out other devices
		return user;
	}

	private void sendVerification(AppUser user) {
		String token = tokens.issue(user.getId(), TokenPurpose.VERIFY_EMAIL, props.auth().verificationTokenTtl());
		mail.sendVerification(user.getEmail(), user.getDisplayName(), link("/verify-email", token));
	}

	private Optional<AppUser> findLocal(String email) {
		return users.findByProviderAndProviderUserId(AppUser.LOCAL_PROVIDER, email);
	}

	private String link(String path, String token) {
		return UriComponentsBuilder.fromUriString(props.baseUrl()).path(path).queryParam("token", token).build()
				.toUriString();
	}

	private Instant now() {
		return Instant.now(clock);
	}

	private static String normalise(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static ApiException invalidLink() {
		return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN",
				"This link is invalid or has expired. Please request a new one.");
	}
}
