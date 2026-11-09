package com.dsamaster.config;

import com.dsamaster.auth.AppOAuth2UserService;
import com.dsamaster.auth.AppOidcUserService;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {

	public static final String SESSION_COOKIE = "DSA_SESSION";

	@Bean
	SecurityContextRepository securityContextRepository() {
		return new HttpSessionSecurityContextRepository();
	}

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			ObjectProvider<ClientRegistrationRepository> clientRegistrations,
			AppOAuth2UserService oauth2UserService,
			AppOidcUserService oidcUserService,
			SecurityContextRepository securityContextRepository) throws Exception {

		PathPatternRequestMatcher.Builder paths = PathPatternRequestMatcher.withDefaults();

		http
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/auth/session").permitAll()
				.requestMatchers("/api/dev/**").permitAll()
				.requestMatchers("/api/**").authenticated()
				// Everything else is the SPA, static assets, OAuth endpoints and health.
				.anyRequest().permitAll())
			.securityContext(ctx -> ctx.securityContextRepository(securityContextRepository))
			.csrf(csrf -> csrf
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))
			// API calls get a 401 instead of a redirect to a login page.
			.exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
				new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), paths.matcher("/api/**")))
			.logout(logout -> logout
				.logoutRequestMatcher(paths.matcher(HttpMethod.POST, "/api/auth/logout"))
				.logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))
				.deleteCookies(SESSION_COOKIE))
			.formLogin(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable);

		if (clientRegistrations.getIfAvailable() != null) {
			http.oauth2Login(oauth -> oauth
				.loginPage("/")
				.userInfoEndpoint(userInfo -> userInfo
					.userService(oauth2UserService)
					.oidcUserService(oidcUserService))
				.defaultSuccessUrl("/", false)
				.failureUrl("/?login=error"));
		}

		return http.build();
	}
}
