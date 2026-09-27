export type Perfume = {
  id: string;
  brand: string;
  brand_ko: string | null;
  name: string;
  name_ko: string | null;
  conc: string;
  family: string;
  year: number | null;
  top: string[];
  heart: string[];
  base: string[];
  seasons: string[];
  mood: string[];
  created_at: string;
};

export type CuratorReview = {
  perfume_id: string;
  rating: number;
  longevity: number;
  sillage: number;
  body: string;
  is_example: boolean;
  updated_at: string;
};

export type Quote = {
  id: string;
  perfume_id: string;
  author_id: string;
  rating: number | null;
  body: string;
  created_at: string;
  profiles?: { display_name: string } | null;
};

export type RequestRow = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  created_by: string | null;
  status: "pending" | "added" | "rejected";
  perfume_id: string | null;
  created_at: string;
  votes: number;
};

export type Newsletter = {
  id: string;
  vol: number;
  title: string;
  body: string;
  is_example: boolean;
  published_at: string;
  sent_at: string | null;
  sent_count: number | null;
};
