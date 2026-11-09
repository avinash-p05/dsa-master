package com.dsamaster.progress;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * A user's state for one problem: solved/review schedule, revisit flag and notes.
 * Rows with nothing left in them are deleted rather than stored empty.
 */
@Entity
@Table(name = "problem_progress")
public class ProblemProgress {

	@EmbeddedId
	private ProblemProgressId id;

	@Column(name = "solved_at")
	private Instant solvedAt;

	@Column(name = "review_stage", nullable = false)
	private int reviewStage;

	@Column(name = "last_reviewed_at")
	private Instant lastReviewedAt;

	@Column(nullable = false)
	private boolean flagged;

	@Column(length = 10_000)
	private String note;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected ProblemProgress() {
		// for JPA
	}

	public ProblemProgress(ProblemProgressId id) {
		this.id = id;
	}

	public void apply(Instant solvedAt, int reviewStage, Instant lastReviewedAt, boolean flagged, String note,
			Instant now) {
		this.solvedAt = solvedAt;
		// Review data only makes sense for solved problems.
		this.reviewStage = solvedAt == null ? 0 : reviewStage;
		this.lastReviewedAt = solvedAt == null ? null : lastReviewedAt;
		this.flagged = flagged;
		this.note = note;
		this.updatedAt = now;
	}

	public boolean isEmpty() {
		return solvedAt == null && !flagged && (note == null || note.isBlank());
	}

	public ProblemProgressId getId() { return id; }
	public String getProblemSlug() { return id.getProblemSlug(); }
	public Instant getSolvedAt() { return solvedAt; }
	public int getReviewStage() { return reviewStage; }
	public Instant getLastReviewedAt() { return lastReviewedAt; }
	public boolean isFlagged() { return flagged; }
	public String getNote() { return note; }
	public Instant getUpdatedAt() { return updatedAt; }
}
