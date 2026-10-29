import 'server-only';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { createApplicationSchema } from '@/lib/validators/applications';
import { createApplication, listApplications } from '@/lib/repositories/applications';
import { serializeApplication } from '@/lib/utils/serialization';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docs = await listApplications(session.user.id);
    const applications = docs.map((doc) => serializeApplication(doc as Record<string, unknown>));
    return NextResponse.json({ applications });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string') {
          errors[path] = issue.message;
        }
      }
      return NextResponse.json({ error: 'Invalid input', errors }, { status: 400 });
    }

    const now = new Date();
    if (parsed.data.appliedAt > now) {
      return NextResponse.json({ error: 'Invalid input', errors: { appliedAt: 'Applied date cannot be in the future' } }, { status: 400 });
    }

    const doc = await createApplication(session.user.id, {
      company: parsed.data.company,
      role: parsed.data.role,
      appliedAt: parsed.data.appliedAt,
      status: parsed.data.status,
    });

    if (!doc) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ application: serializeApplication(doc as Record<string, unknown>) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
