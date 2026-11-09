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

	protected AppUser() {
		// for JPA
	}

	public AppUser(String provider, String providerUserId, Instant now) {
		this.provider = provider;
		this.providerUserId = providerUserId;
		this.createdAt = now;
		this.lastLoginAt = now;
	}

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
