package com.dsamaster.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

/**
 * Registers only the OAuth providers whose credentials are present
 * (GITHUB_CLIENT_ID / GOOGLE_CLIENT_ID ...). With none configured the app still
 * starts, and OAuth login is simply unavailable (useful for local development).
 */
@Configuration(proxyBeanMethods = false)
public class OAuthClientConfig {

	@Bean
	@Conditional(AnyProviderConfigured.class)
	ClientRegistrationRepository clientRegistrationRepository(AppProperties props) {
		List<ClientRegistration> registrations = new ArrayList<>();
		AppProperties.Client github = props.oauth().github();
		AppProperties.Client google = props.oauth().google();

		if (github.isConfigured()) {
			registrations.add(CommonOAuth2Provider.GITHUB.getBuilder("github")
					.clientId(github.clientId())
					.clientSecret(github.clientSecret())
					.scope("read:user", "user:email")
					.build());
		}
		if (google.isConfigured()) {
			registrations.add(CommonOAuth2Provider.GOOGLE.getBuilder("google")
					.clientId(google.clientId())
					.clientSecret(google.clientSecret())
					.build());
		}
		return new InMemoryClientRegistrationRepository(registrations);
	}

	static class AnyProviderConfigured implements Condition {
		@Override
		public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
			return Binder.get(context.getEnvironment())
					.bind("app.oauth", AppProperties.OAuth.class)
					.map(oauth -> !oauth.configuredProviders().isEmpty())
					.orElse(false);
		}
	}
}
