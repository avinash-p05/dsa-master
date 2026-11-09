package com.dsamaster.progress.dto;

import com.dsamaster.progress.ProblemProgress;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * One problem's progress as exchanged with the SPA. Timestamps are epoch
 * milliseconds; {@code solvedAt == null} means unsolved.
 */
public record ProgressEntry(
		@NotBlank @Pattern(regexp = ProgressEntry.SLUG_PATTERN) String slug,
		@PositiveOrZero Long solvedAt,
		@Min(0) @Max(10) int reviewStage,
		@PositiveOrZero Long lastReviewedAt,
		boolean flagged,
		String note) {

	/** LeetCode-style slug: lowercase letters, digits and dashes. */
	public static final String SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

	public static ProgressEntry from(ProblemProgress p) {
		return new ProgressEntry(
				p.getProblemSlug(),
				p.getSolvedAt() == null ? null : p.getSolvedAt().toEpochMilli(),
				p.getReviewStage(),
				p.getLastReviewedAt() == null ? null : p.getLastReviewedAt().toEpochMilli(),
				p.isFlagged(),
				p.getNote());
	}
}
