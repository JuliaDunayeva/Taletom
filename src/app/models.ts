export interface Author {
  id: string;
  user_id: string | null;
  pen_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  annotation: string | null;
  author_id: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  series_name: string | null;
  cover_url: string | null;
  short_description: string | null;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
}
