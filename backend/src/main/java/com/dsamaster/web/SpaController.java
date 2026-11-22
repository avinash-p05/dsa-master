package com.dsamaster.web;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * The React app uses client-side routing, so a refresh or a shared link like /topic/graphs must
 * return HTML that boots the app.
 *
 * Public pages (home, guide, every topic) are pre-rendered at build time (frontend/seo/prerender.ts)
 * into static/_pages/ with their own title, description and text, so search engines can index them;
 * each route forwards to its own file. Private pages get the empty, non-indexed shell. Static files
 * and /api are served normally. "/" is served by Spring's welcome page (static/index.html, the
 * pre-rendered home page).
 */
@Controller
public class SpaController {

	private static final Pattern SLUG = Pattern.compile("[a-z0-9-]{1,64}");

	/** Pre-rendered file -> whether it exists in this build (the set is fixed per build). */
	private final Map<String, Boolean> exists = new ConcurrentHashMap<>();

	@GetMapping({ "/topic/{slug}", "/topic/{slug}/", "/topic/{slug}/{problemId}" })
	public String topic(@PathVariable String slug) {
		// Unknown topic: the shell boots the app, which shows its own "not found" page.
		return SLUG.matcher(slug).matches() ? page("topic/" + slug) : shell();
	}

	@GetMapping({ "/guide", "/guide/" })
	public String guide() {
		return page("guide");
	}

	@GetMapping({ "/review", "/verify-email", "/reset-password" })
	public String shell() {
		return has("spa") ? "forward:/_pages/spa.html" : "forward:/index.html";
	}

	private String page(String name) {
		return has(name) ? "forward:/_pages/" + name + ".html" : shell();
	}

	private boolean has(String name) {
		return exists.computeIfAbsent(name, n -> new ClassPathResource("static/_pages/" + n + ".html").exists());
	}
}
