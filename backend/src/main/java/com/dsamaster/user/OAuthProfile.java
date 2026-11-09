package com.dsamaster.user;

/** Normalised identity details from any provider. */
public record OAuthProfile(
		String provider,
		String providerUserId,
		String email,
		String displayName,
		String avatarUrl) {

	private static String truncate(String value, int max) {
		return value == null || value.length() <= max ? value : value.substring(0, max);
	}

	public OAuthProfile {
		email = truncate(email, 320);
		displayName = truncate(displayName, 200);
		avatarUrl = truncate(avatarUrl, 1000);
	}
}
