package com.dsamaster.auth.dto;

import java.util.List;

/**
 * What the SPA needs on load: who is signed in (if anyone) and which login
 * providers are available.
 */
public record SessionResponse(boolean authenticated, UserResponse user, List<String> providers) {
}
