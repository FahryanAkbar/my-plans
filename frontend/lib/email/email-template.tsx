import * as React from 'react';

export interface EmailTemplateProps {
  firstName?: string;
  recipientName?: string;
  subjectTitle?: string;
  previewText?: string;
  intro?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerText?: string;
  brandName?: string;
}

const styles = {
  root: {
    margin: 0,
    padding: '24px 0',
    backgroundColor: '#f6f7fb',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#0f172a',
  } as React.CSSProperties,
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '24px',
  } as React.CSSProperties,
  preview: {
    display: 'none',
    overflow: 'hidden',
    lineHeight: 1,
    opacity: 0,
    maxHeight: 0,
    maxWidth: 0,
  } as React.CSSProperties,
  brand: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#64748b',
    fontWeight: 700,
  } as React.CSSProperties,
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    lineHeight: '32px',
    color: '#0f172a',
  } as React.CSSProperties,
  paragraph: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    lineHeight: '22px',
    color: '#334155',
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    margin: '12px 0 16px 0',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    backgroundColor: '#2563eb',
    color: '#ffffff',
  } as React.CSSProperties,
  footer: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    lineHeight: '18px',
    color: '#64748b',
  } as React.CSSProperties,
};

export function EmailTemplate({
  firstName,
  recipientName,
  subjectTitle = 'Welcome!',
  previewText = 'You have a new message.',
  intro,
  message = 'Thanks for joining us. We are excited to have you here.',
  ctaLabel = 'Open dashboard',
  ctaUrl,
  footerText = 'If you did not expect this email, you can safely ignore it.',
  brandName = 'My PLAN',
}: EmailTemplateProps) {
  const displayName = recipientName ?? firstName ?? 'there';
  const introLine = intro ?? `Hi ${displayName},`;

  return (
    <div style={styles.root}>
      <div style={styles.preview}>{previewText}</div>

      <div style={styles.container}>
        <p style={styles.brand}>{brandName}</p>
        <h1 style={styles.title}>{subjectTitle}</h1>

        <p style={styles.paragraph}>{introLine}</p>
        <p style={styles.paragraph}>{message}</p>

        {ctaUrl ? (
          <a href={ctaUrl} style={styles.button}>
            {ctaLabel}
          </a>
        ) : null}

        <p style={styles.footer}>{footerText}</p>
      </div>
    </div>
  );
}
