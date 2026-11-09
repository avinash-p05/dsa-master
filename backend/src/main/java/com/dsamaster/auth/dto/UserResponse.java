package com.dsamaster.auth.dto;

import com.dsamaster.user.AppUser;

public record UserResponse(long id, String provider, String name, String email, String avatarUrl) {

	public static UserResponse from(AppUser user) {
		return new UserResponse(user.getId(), user.getProvider(), user.getDisplayName(), user.getEmail(),
				user.getAvatarUrl());
	}
}
