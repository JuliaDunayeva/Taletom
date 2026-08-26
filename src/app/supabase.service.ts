import { Injectable } from '@angular/core';
import {
  AuthResponse,
  Session,
  SupabaseClient,
  createClient
} from '@supabase/supabase-js';

import { environment } from '../environments/environment';
import { Author, Book, Chapter } from './models';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  // =========================
  // AUTH
  // =========================

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  async signUp(
    displayName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          pen_name: displayName
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
  }

  async signIn(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return await this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } =
      await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

    if (error) {
      throw error;
    }
  }

  onAuthStateChange(
    callback: (session: Session | null) => void
  ): void {
    this.client.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  // =========================
  // AUTHORS
  // =========================

  async getAuthorByPenName(
    penName: string
  ): Promise<Author | null> {
    const { data, error } = await this.client
      .from('authors')
      .select(
        'id,user_id,pen_name,bio,avatar_url,created_at'
      )
      .eq('pen_name', penName)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as Author | null;
  }

  // =========================
  // BOOKS
  // =========================

  async getBooksByAuthor(
    authorId: string
  ): Promise<Book[]> {
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

    if (error) {
      throw error;
    }

    return (data ?? []) as Book[];
  }

  async getBook(
    bookId: string
  ): Promise<Book | null> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('id', bookId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as Book | null;
  }

  async createBook(book: {
  userId: string;
  authorName: string;
  title: string;
  genre: string;
  seriesName: string;
  shortDescription: string;
  annotation: string;
  contentWarnings: string;
}): Promise<Book> {
  const { data, error } = await this.client
    .from('books')
    .insert({
      user_id: book.userId,
      author: book.authorName,
      title: book.title,
      genre: book.genre,
      series_name: book.seriesName || null,
      short_description: book.shortDescription || null,
      annotation: book.annotation || null,
      content_warnings: book.contentWarnings || null,
      is_published: false
    })
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data as Book;
}
async getBooksByUser(
  userId: string
): Promise<Book[]> {
  const { data, error } = await this.client
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false
    });
  if (error) {
    throw error;
  }
  return (data ?? []) as Book[];
}


  // =========================
  // CHAPTERS
  // =========================

  async getPublishedChapters(
    bookId: string
  ): Promise<Chapter[]> {
    const { data, error } = await this.client
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Chapter[];
  }
}

