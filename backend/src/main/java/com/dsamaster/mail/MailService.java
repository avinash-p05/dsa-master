package com.dsamaster.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import com.dsamaster.config.AppProperties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Sends account emails over SMTP (any provider: Gmail, Brevo, Zoho, SES...).
 * Configure with SMTP_HOST / SMTP_PORT / SMTP_USERNAME / SMTP_PASSWORD / MAIL_FROM.
 * Sending is asynchronous so API responses don't wait on the mail server.
 * If no SMTP host is configured, the email (including its link) is logged instead.
 */
@Service
public class MailService {

	private static final Logger log = LoggerFactory.getLogger(MailService.class);

	private final ObjectProvider<JavaMailSender> mailSender;
	private final boolean smtpConfigured;
	private final AppProperties props;

	public MailService(ObjectProvider<JavaMailSender> mailSender, Environment env, AppProperties props) {
		this.mailSender = mailSender;
		this.smtpConfigured = StringUtils.hasText(env.getProperty("spring.mail.host"));
		this.props = props;
		if (!smtpConfigured) log.warn("SMTP_HOST is not set: emails will be written to the log instead of sent.");
	}

	@Async
	public void sendVerification(String to, String name, String link) {
		send(to, EmailTemplates.verifyEmail(name, link));
	}

	@Async
	public void sendPasswordReset(String to, String name, String link) {
		send(to, EmailTemplates.resetPassword(name, link));
	}

	@Async
	public void sendAccountExists(String to, String name, String signInLink, String resetLink) {
		send(to, EmailTemplates.accountExists(name, signInLink, resetLink));
	}

	private void send(String to, EmailTemplates.Email email) {
		JavaMailSender sender = smtpConfigured ? mailSender.getIfAvailable() : null;
		if (sender == null) {
			log.info("[mail disabled] To: {} | Subject: {}\n{}", to, email.subject(), email.text());
			return;
		}
		try {
			MimeMessage message = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setFrom(props.mail().from());
			helper.setTo(to);
			helper.setSubject(email.subject());
			helper.setText(email.text(), email.html());
			sender.send(message);
			log.debug("Sent '{}' to {}", email.subject(), to);
		} catch (MessagingException | MailException e) {
			log.error("Failed to send '{}' to {}: {}", email.subject(), to, e.getMessage());
		}
	}
}
