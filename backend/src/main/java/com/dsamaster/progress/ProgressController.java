package com.dsamaster.progress;

import com.dsamaster.auth.AppPrincipal;
import com.dsamaster.progress.dto.ProgressEntry;
import com.dsamaster.progress.dto.ProgressListResponse;
import com.dsamaster.progress.dto.ProgressMergeRequest;
import com.dsamaster.progress.dto.ProgressUpdateRequest;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in user's progress. All endpoints require authentication. */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

	private final ProgressService progress;

	public ProgressController(ProgressService progress) {
		this.progress = progress;
	}

	@GetMapping
	public ProgressListResponse list(@AuthenticationPrincipal AppPrincipal user) {
		return new ProgressListResponse(progress.list(user.getUserId()));
	}

	/** Returns the saved entry, or 204 if the update cleared it. */
	@PutMapping("/{slug}")
	public ResponseEntity<ProgressEntry> put(@AuthenticationPrincipal AppPrincipal user, @PathVariable String slug,
			@Valid @RequestBody ProgressUpdateRequest body) {
		ProgressEntry saved = progress.put(user.getUserId(), slug, body);
		return saved == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(saved);
	}

	@PostMapping("/merge")
	public ProgressListResponse merge(@AuthenticationPrincipal AppPrincipal user,
			@Valid @RequestBody ProgressMergeRequest body) {
		return new ProgressListResponse(progress.merge(user.getUserId(), body.problems()));
	}

	@DeleteMapping
	public ResponseEntity<Void> reset(@AuthenticationPrincipal AppPrincipal user) {
		progress.reset(user.getUserId());
		return ResponseEntity.noContent().build();
	}
}
