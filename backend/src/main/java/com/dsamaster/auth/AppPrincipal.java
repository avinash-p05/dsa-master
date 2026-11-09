package com.dsamaster.auth;

/**
 * Implemented by every authenticated principal (GitHub, Google, dev login),
 * so controllers can get our own user id with
 * {@code @AuthenticationPrincipal AppPrincipal principal}.
 */
public interface AppPrincipal {

	long getUserId();
}
