package com.dsamaster.user;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class AppUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 20)
	private String provider;

	@Column(name = "provider_user_id", nullable = false, length = 100)
	private String providerUserId;

	@Column(length = 320)
	private String email;

	@Column(name = "display_name", length = 200)
	private String displayName;

	@Column(name = "avatar_url", length = 1000)
	private String avatarUrl;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "last_login_at", nullable = false)
	private Instant lastLoginAt;

	/** BCrypt hash; only set for email/password ("local") accounts. */
	@Column(name = "password_hash", length = 100)
	private String passwordHash;

	@Column(name = "email_verified", nullable = false)
	private boolean emailVerified;

	public static final String LOCAL_PROVIDER = "local";

	protected AppUser() {
		// for JPA
	}

	public AppUser(String provider, String providerUserId, Instant now) {
		this.provider = provider;
		this.providerUserId = providerUserId;
		this.createdAt = now;
		this.lastLoginAt = now;
	}

	/** New, unverified email/password account. {@code email} must already be normalised. */
	public static AppUser local(String email, String displayName, String passwordHash, Instant now) {
		AppUser user = new AppUser(LOCAL_PROVIDER, email, now);
		user.email = email;
		user.displayName = displayName;
		user.passwordHash = passwordHash;
		return user;
	}

	public boolean isLocal() {
		return LOCAL_PROVIDER.equals(provider);
	}

	public void changePassword(String newHash) {
		this.passwordHash = newHash;
	}

	public void markEmailVerified() {
		this.emailVerified = true;
	}

	public void recordLogin(Instant now) {
		this.lastLoginAt = now;
	}

	public String getPasswordHash() { return passwordHash; }
	public boolean isEmailVerified() { return emailVerified; }

	/** Refresh profile details from the identity provider on each login. */
	public void updateProfile(OAuthProfile profile, Instant now) {
		this.email = profile.email();
		this.displayName = profile.displayName();
		this.avatarUrl = profile.avatarUrl();
		this.lastLoginAt = now;
	}

	public Long getId() { return id; }
	public String getProvider() { return provider; }
	public String getProviderUserId() { return providerUserId; }
	public String getEmail() { return email; }
	public String getDisplayName() { return displayName; }
	public String getAvatarUrl() { return avatarUrl; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getLastLoginAt() { return lastLoginAt; }
}
