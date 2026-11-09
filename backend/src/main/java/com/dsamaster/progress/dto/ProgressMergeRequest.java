package com.dsamaster.progress.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Progress collected while signed out (or from an export file) to fold into the account. */
public record ProgressMergeRequest(@NotNull @Size(max = 2000) List<@Valid ProgressEntry> problems) {
}
