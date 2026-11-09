package com.dsamaster.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

/** Typed view of the {@code app.*} properties in application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(OAuth oauth, Progress progress, boolean devLoginEnabled) {

	public AppProperties {
		oauth = oauth != null ? oauth : new OAuth(null, null);
		progress = progress != null ? progress : new Progress(2000, 10_000);
	}

	public record OAuth(Client github, Client google) {
		public OAuth {
			github = github != null ? github : new Client(null, null);
			google = google != null ? google : new Client(null, null);
		}

		/** Registration ids ("github", "google") that have credentials configured. */
		public List<String> configuredProviders() {
			List<String> ids = new ArrayList<>();
			if (github.isConfigured()) ids.add("github");
			if (google.isConfigured()) ids.add("google");
			return ids;
		}
	}

	public record Client(String clientId, String clientSecret) {
		public boolean isConfigured() {
			return StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret);
		}
	}

	public record Progress(int maxEntriesPerUser, int maxNoteLength) {
	}
}
