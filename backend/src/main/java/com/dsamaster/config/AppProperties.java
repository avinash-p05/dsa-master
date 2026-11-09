package com.dsamaster.config;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

/** Typed view of the {@code app.*} properties in application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
		String baseUrl,
		Mail mail,
		Auth auth,
		OAuth oauth,
		Progress progress,
		boolean devLoginEnabled) {

	public AppProperties {
		baseUrl = StringUtils.hasText(baseUrl) ? baseUrl.replaceAll("/+$", "") : "http://localhost:5173";
		mail = mail != null ? mail : new Mail(null);
		auth = auth != null ? auth : new Auth(true, null, null);
		oauth = oauth != null ? oauth : new OAuth(null, null);
		progress = progress != null ? progress : new Progress(2000, 10_000);
	}

	public record Mail(String from) {
		public Mail {
			from = StringUtils.hasText(from) ? from : "DSA Master <no-reply@localhost>";
		}
	}

	public record Auth(boolean passwordLoginEnabled, Duration verificationTokenTtl, Duration resetTokenTtl) {
		public Auth {
			verificationTokenTtl = verificationTokenTtl != null ? verificationTokenTtl : Duration.ofHours(24);
			resetTokenTtl = resetTokenTtl != null ? resetTokenTtl : Duration.ofHours(1);
		}
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
