package com.dsamaster.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ClockConfig {

	/** Injectable clock so time-dependent logic can be tested. */
	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}
}
