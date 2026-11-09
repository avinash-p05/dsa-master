package com.dsamaster.progress.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

/** Full replacement of one problem's state (PUT semantics). */
public record ProgressUpdateRequest(
		@PositiveOrZero Long solvedAt,
		@Min(0) @Max(10) int reviewStage,
		@PositiveOrZero Long lastReviewedAt,
		boolean flagged,
		String note) {
}
