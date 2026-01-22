import { useSearchParams } from "react-router-dom";
import { z } from "zod";

const filtersSchema = z.object({
  order: z.string().optional(),
  scooterType: z.string().optional(),
  level: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
});

export function useOrderFollowFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = filtersSchema.parse({
    order: searchParams.get("order") ?? undefined,
    scooterType: searchParams.get("scooterType") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    page: searchParams.get("page") ?? 1,
    pageSize: searchParams.get("pageSize") ?? 10,
  });

  const setFilters = (newFilters: Partial<z.infer<typeof filtersSchema>>) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 0) {
        newSearchParams.set(key, String(value));
      } else {
        newSearchParams.delete(key);
      }
    });

    if (newFilters.pageSize) {
      newSearchParams.set("page", "1");
    }

    setSearchParams(newSearchParams);
  };

  return { filters, setFilters };
}
