import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { MovementHistoryItem } from '../types';

const PAGE_SIZE = 10;

const fetchMovementHistory = async ({
  pageParam = 0,
  referencia,
}: {
  pageParam?: number;
  referencia: string;
}): Promise<MovementHistoryItem[]> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('vista_timeline_repuesto')
    .select('*')
    .eq('referencia', referencia)
    .order('fecha_movimiento', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useMovementHistory = (referencia: string) => {
  return useInfiniteQuery({
    queryKey: ['movementHistory', referencia],
    queryFn: ({ pageParam }) => fetchMovementHistory({ pageParam, referencia }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had fewer items than the page size, there are no more pages.
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, return the next page number.
      return allPages.length;
    },
  });
};
