package com.dsamaster.common;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Small in-memory sliding-window limiter for auth endpoints (login attempts,
 * sign-ups, emails sent). Good enough for a single instance; swap for a shared
 * store if the app is ever scaled horizontally.
 */
@Component
public class RateLimiter {

	private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
	private final Clock clock;

	public RateLimiter(Clock clock) {
		this.clock = clock;
	}

	/** Records a hit for {@code key}; throws 429 if more than {@code max} hits fall within {@code window}. */
	public void check(String key, int max, Duration window) {
		long now = clock.millis();
		long cutoff = now - window.toMillis();
		Deque<Long> times = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
		synchronized (times) {
			while (!times.isEmpty() && times.peekFirst() < cutoff) times.pollFirst();
			if (times.size() >= max) {
				throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
						"Too many attempts. Please wait a few minutes and try again.");
			}
			times.addLast(now);
		}
	}

	/** Drop idle keys so memory stays bounded. */
	@Scheduled(fixedDelay = 10 * 60 * 1000)
	void evictIdle() {
		long cutoff = clock.millis() - Duration.ofHours(2).toMillis();
		hits.entrySet().removeIf(e -> {
			synchronized (e.getValue()) {
				Long last = e.getValue().peekLast();
				return last == null || last < cutoff;
			}
		});
	}
}
