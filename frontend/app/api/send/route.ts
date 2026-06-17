import { EmailTemplate } from '@/lib';
import { Resend } from 'resend';

type SendEmailBody = {
  to: string | string[];
  subject?: string;
  from?: string;
  template?: {
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
  };
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendEmailBody;
    const recipients = Array.isArray(body.to) ? body.to : [body.to];

    if (!recipients.length || recipients.some((email) => !isValidEmail(email))) {
      return Response.json({ error: 'Invalid "to" email recipient(s)' }, { status: 400 });
    }

    const from = body.from ?? process.env.RESEND_FROM_EMAIL ?? 'My-Plan <no-reply@myplans.my.id>';
    const subject = body.subject ?? body.template?.subjectTitle ?? 'You have a new message';
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey && process.env.NODE_ENV !== 'production') {
      return Response.json(
        {
          success: true,
          mocked: true,
          message: 'Email provider not configured (RESEND_API_KEY missing).',
          to: recipients,
          subject,
        },
        { status: 200 },
      );
    }

    if (!apiKey) {
      return Response.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      react: EmailTemplate({
        ...body.template,
        subjectTitle: body.template?.subjectTitle ?? subject,
      }),
    });

    if (error) {
      return Response.json(
        {
          error: 'Resend failed to send email',
          details: error,
          hint: 'Check RESEND_API_KEY and RESEND_FROM_EMAIL/domain verification in Resend dashboard.',
        },
        { status: 502 },
      );
    }

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('POST /api/send error:', error);
    return Response.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 },
    );
  }
}
