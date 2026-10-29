import 'server-only';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { updateApplicationSchema } from '@/lib/validators/applications';
import { deleteApplication, updateApplication } from '@/lib/repositories/applications';
import { serializeApplication } from '@/lib/utils/serialization';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

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

    if (parsed.data.appliedAt) {
      const now = new Date();
      if (parsed.data.appliedAt > now) {
        return NextResponse.json({ error: 'Invalid input', errors: { appliedAt: 'Applied date cannot be in the future' } }, { status: 400 });
      }
    }

    const doc = await updateApplication(session.user.id, id, parsed.data);

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ application: serializeApplication(doc as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteApplication(session.user.id, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
