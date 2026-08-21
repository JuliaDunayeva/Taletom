import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Author, Book } from './models';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly db = inject(SupabaseService);

  author: Author | null = null;
  books: Book[] = [];
  loading = true;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      this.author = await this.db.getAuthorByPenName('Крис Дурбин');

      if (!this.author) {
        this.errorMessage = 'Автор «Крис Дурбин» не найден в Supabase.';
        return;
      }

      this.books = await this.db.getBooksByAuthor(this.author.id);
    } catch (error) {
      console.error(error);
      this.errorMessage =
        'Не удалось получить данные из Supabase. Проверь URL, public key и RLS policies.';
    } finally {
      this.loading = false;
    }
  }

  coverPath(book: Book): string {
    if (!book.cover_url) {
      return '/Images/Covers/placeholder.svg';
    }

    return book.cover_url.startsWith('/')
      ? book.cover_url
      : `/${book.cover_url}`;
  }
}
