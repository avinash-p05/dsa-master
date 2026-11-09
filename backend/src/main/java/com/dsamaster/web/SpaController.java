package com.dsamaster.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * The React app uses client-side routing. Forward its routes to index.html so
 * a refresh or a shared link like /topic/graphs works. Static files and /api
 * are served normally.
 */
@Controller
public class SpaController {

	@GetMapping({ "/topic/**", "/review", "/guide" })
	public String forwardToIndex() {
		return "forward:/index.html";
	}
}
