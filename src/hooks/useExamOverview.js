import { useEffect, useState } from 'react';

import { EXAM_OVERVIEW_FALLBACK } from '../config';
import { fetchTopics } from '../lib/questionBank';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Module names and the total question count, for copy that quotes them.
 *
 * `public.topics` is readable by anonymous visitors precisely so the landing
 * page can do this without a session. The fallback in config.js is the first
 * paint and the offline answer, so nothing ever renders "0 questions" while a
 * request is in flight.
 *
 * Module *content* and the questions themselves are not public — those need an
 * authenticated session.
 */
export function useExamOverview() {
  const [overview, setOverview] = useState(() => ({ ...EXAM_OVERVIEW_FALLBACK, loading: true }));

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setOverview({ ...EXAM_OVERVIEW_FALLBACK, loading: false });
      return;
    }

    let active = true;

    fetchTopics()
      .then((rows) => {
        if (!active || !rows.length) return;
        setOverview({
          questionCount: rows.reduce((sum, t) => sum + (t.question_count ?? 0), 0),
          topics: rows.map((t) => t.name),
          loading: false,
        });
      })
      // Marketing copy is not worth an error state — keep the fallback numbers.
      .catch(() => active && setOverview({ ...EXAM_OVERVIEW_FALLBACK, loading: false }));

    return () => {
      active = false;
    };
  }, []);

  return overview;
}
