package com.dsamaster.mail;

import org.springframework.web.util.HtmlUtils;

/** Plain-text + simple HTML bodies for account emails. */
final class EmailTemplates {

	record Email(String subject, String text, String html) {
	}

	private EmailTemplates() {
	}

	static Email verifyEmail(String name, String link) {
		String subject = "Verify your email for DSA Master";
		String intro = "Confirm your email address to finish creating your DSA Master account.";
		String note = "This link expires in 24 hours. If you didn't sign up, you can ignore this email.";
		return build(subject, name, intro, "Verify email", link, note);
	}

	static Email resetPassword(String name, String link) {
		String subject = "Reset your DSA Master password";
		String intro = "We received a request to reset your password. Choose a new one using the link below.";
		String note = "This link expires in 1 hour. If you didn't ask for this, you can ignore this email; your password won't change.";
		return build(subject, name, intro, "Reset password", link, note);
	}

	static Email accountExists(String name, String signInLink, String resetLink) {
		String subject = "You already have a DSA Master account";
		String intro = "Someone tried to create an account with this email, but you already have one. "
				+ "Sign in at " + signInLink + ", or reset your password if you've forgotten it.";
		String note = "If this wasn't you, no action is needed.";
		return build(subject, name, intro, "Reset password", resetLink, note);
	}

	private static Email build(String subject, String name, String intro, String action, String link, String note) {
		String greeting = "Hi " + (name == null || name.isBlank() ? "there" : name) + ",";

		String text = greeting + "\n\n" + intro + "\n\n" + action + ": " + link + "\n\n" + note + "\n\n— DSA Master\n";

		String safeLink = HtmlUtils.htmlEscape(link);
		String html = """
				<div style="font-family:Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171a26">
				  <h2 style="margin:0 0 16px;font-size:20px">DSA Master</h2>
				  <p>%s</p>
				  <p>%s</p>
				  <p style="margin:28px 0">
				    <a href="%s" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">%s</a>
				  </p>
				  <p style="font-size:13px;color:#5d6478">Or paste this link into your browser:<br><a href="%s" style="color:#4f46e5;word-break:break-all">%s</a></p>
				  <p style="font-size:13px;color:#5d6478">%s</p>
				</div>
				""".formatted(HtmlUtils.htmlEscape(greeting), HtmlUtils.htmlEscape(intro), safeLink,
				HtmlUtils.htmlEscape(action), safeLink, safeLink, HtmlUtils.htmlEscape(note));

		return new Email(subject, text, html);
	}
}
