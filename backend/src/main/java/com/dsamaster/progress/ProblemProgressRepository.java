package com.dsamaster.progress;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProblemProgressRepository extends JpaRepository<ProblemProgress, ProblemProgressId> {

	List<ProblemProgress> findAllByIdUserIdOrderByIdProblemSlug(Long userId);

	long countByIdUserId(Long userId);

	@Modifying
	@Query("delete from ProblemProgress p where p.id.userId = :userId")
	int deleteAllForUser(@Param("userId") Long userId);
}
