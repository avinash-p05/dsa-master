package com.dsamaster.progress;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProblemProgressId implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "problem_slug", nullable = false, length = 120)
	private String problemSlug;

	protected ProblemProgressId() {
		// for JPA
	}

	public ProblemProgressId(Long userId, String problemSlug) {
		this.userId = userId;
		this.problemSlug = problemSlug;
	}

	public Long getUserId() { return userId; }
	public String getProblemSlug() { return problemSlug; }

	@Override
	public boolean equals(Object o) {
		return this == o || (o instanceof ProblemProgressId other
				&& Objects.equals(userId, other.userId) && Objects.equals(problemSlug, other.problemSlug));
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, problemSlug);
	}
}
