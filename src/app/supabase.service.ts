import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Author, Book, Chapter } from './models';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  async getAuthorByPenName(penName: string): Promise<Author | null> {
    const { data, error } = await this.client
      .from('authors')
      .select('id,user_id,pen_name,bio,avatar_url,created_at')
      .eq('pen_name', penName)
      .maybeSingle();

    if (error) throw error;
    return data as Author | null;
  }

  async getBooksByAuthor(authorId: string): Promise<Book[]> {
    const { data, error } = await this.client
      .from('books')
      .select(`
        id,
        title,
        author,
        annotation,
        author_id,
        is_published,
        created_at,
        updated_at,
        series_name,
        cover_url,
        short_description
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Book[];
  }

  async getBook(bookId: string): Promise<Book | null> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('id', bookId)
      .maybeSingle();

    if (error) throw error;
    return data as Book | null;
  }

  async getPublishedChapters(bookId: string): Promise<Chapter[]> {
    const { data, error } = await this.client
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Chapter[];
  }
}
