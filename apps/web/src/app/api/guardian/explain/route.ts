import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { guardianGPT } from '../../../../guardian/explain';
import { guardianInspector } from '../../../../guardian/inspector';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, eventId } = await request.json();

    const trustReport = await guardianInspector.inspectUser(user.id);

    let answer: string;

    if (eventId) {
      answer = await guardianGPT.explainEvent(eventId, user.id, trustReport);
    } else if (question) {
      answer = await guardianGPT.answerQuestion(question, user.id, trustReport);
    } else {
      return NextResponse.json(
        { error: 'Question or eventId required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Failed to explain:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
