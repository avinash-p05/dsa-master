package com.dsamaster.progress;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.dsamaster.common.BadRequestException;
import com.dsamaster.config.AppProperties;
import com.dsamaster.progress.dto.ProgressEntry;
import com.dsamaster.progress.dto.ProgressUpdateRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

	private static final Pattern SLUG = Pattern.compile(ProgressEntry.SLUG_PATTERN);
	private static final int MAX_SLUG_LENGTH = 120;

	private final ProblemProgressRepository repository;
	private final AppProperties.Progress limits;
	private final Clock clock;

	public ProgressService(ProblemProgressRepository repository, AppProperties props, Clock clock) {
		this.repository = repository;
		this.limits = props.progress();
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public List<ProgressEntry> list(long userId) {
		return repository.findAllByIdUserIdOrderByIdProblemSlug(userId).stream().map(ProgressEntry::from).toList();
	}

	/** Replace one problem's state. Returns null if the row ended up empty (and was deleted). */
	@Transactional
	public ProgressEntry put(long userId, String slug, ProgressUpdateRequest req) {
		validateSlug(slug);
		String note = normaliseNote(req.note());
		var id = new ProblemProgressId(userId, slug);
		ProblemProgress row = repository.findById(id).orElse(null);

		if (row == null) {
			boolean hasContent = req.solvedAt() != null || req.flagged() || note != null;
			if (!hasContent) return null;
			ensureCapacity(userId, 1);
			row = new ProblemProgress(id);
		}

		row.apply(toInstant(req.solvedAt()), req.reviewStage(), toInstant(req.lastReviewedAt()), req.flagged(),
				note, Instant.now(clock));
		if (row.isEmpty()) {
			repository.delete(row);
			return null;
		}
		return ProgressEntry.from(repository.save(row));
	}

	/**
	 * Fold progress made while signed out into the account without losing
	 * anything: keep the earliest solve, the furthest review stage, the latest
	 * review, either flag, and the server note when both have one.
	 */
	@Transactional
	public List<ProgressEntry> merge(long userId, List<ProgressEntry> incoming) {
		Map<String, ProblemProgress> existing = new HashMap<>();
		repository.findAllByIdUserIdOrderByIdProblemSlug(userId).forEach(p -> existing.put(p.getProblemSlug(), p));

		long newRows = incoming.stream().map(ProgressEntry::slug).distinct().filter(s -> !existing.containsKey(s)).count();
		ensureCapacity(userId, newRows);
		Instant now = Instant.now(clock);

		for (ProgressEntry in : incoming) {
			validateSlug(in.slug());
			String note = normaliseNote(in.note());
			ProblemProgress row = existing.get(in.slug());

			if (row == null) {
				row = new ProblemProgress(new ProblemProgressId(userId, in.slug()));
				row.apply(toInstant(in.solvedAt()), in.reviewStage(), toInstant(in.lastReviewedAt()), in.flagged(),
						note, now);
			} else {
				Instant solvedAt = earliest(row.getSolvedAt(), toInstant(in.solvedAt()));
				int stage = Math.max(row.getReviewStage(), in.solvedAt() == null ? 0 : in.reviewStage());
				Instant lastReviewed = latest(row.getLastReviewedAt(), toInstant(in.lastReviewedAt()));
				String mergedNote = row.getNote() != null && !row.getNote().isBlank() ? row.getNote() : note;
				row.apply(solvedAt, stage, lastReviewed, row.isFlagged() || in.flagged(), mergedNote, now);
			}

			if (row.isEmpty()) {
				if (existing.containsKey(in.slug())) repository.delete(row);
				existing.remove(in.slug());
			} else {
				existing.put(in.slug(), repository.save(row));
			}
		}
		return list(userId);
	}

	@Transactional
	public void reset(long userId) {
		repository.deleteAllForUser(userId);
	}

	private void validateSlug(String slug) {
		if (slug == null || slug.length() > MAX_SLUG_LENGTH || !SLUG.matcher(slug).matches()) {
			throw new BadRequestException("Invalid problem slug");
		}
	}

	private String normaliseNote(String note) {
		if (note == null || note.isBlank()) return null;
		if (note.length() > limits.maxNoteLength()) {
			throw new BadRequestException("Note is longer than " + limits.maxNoteLength() + " characters");
		}
		return note;
	}

	private void ensureCapacity(long userId, long additional) {
		if (additional > 0 && repository.countByIdUserId(userId) + additional > limits.maxEntriesPerUser()) {
			throw new BadRequestException("Too many progress entries");
		}
	}

	private static Instant toInstant(Long epochMillis) {
		return epochMillis == null ? null : Instant.ofEpochMilli(epochMillis);
	}

	private static Instant earliest(Instant a, Instant b) {
		if (a == null) return b;
		if (b == null) return a;
		return a.isBefore(b) ? a : b;
	}

	private static Instant latest(Instant a, Instant b) {
		if (a == null) return b;
		if (b == null) return a;
		return a.isAfter(b) ? a : b;
	}
}
