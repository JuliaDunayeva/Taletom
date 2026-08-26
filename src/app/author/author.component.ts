import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';
import { Book } from '../models';
type AuthorSection = 'books' | 'create-book';
@Component({
  selector: 'app-author',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './author.component.html',
  styleUrl: './author.component.css'
})
export class AuthorComponent implements OnInit {
  session: Session | null = null;
  displayName = '';
  email = '';
  activeSection: AuthorSection = 'books';
  loading = true;
  savingBook = false;
  errorMessage = '';
  successMessage = '';
  books: Book[] = [];
  readonly bookForm: FormGroup<{
    title: FormControl<string>;
    genre: FormControl<string>;
    seriesName: FormControl<string>;
    shortDescription: FormControl<string>;
    annotation: FormControl<string>;
    contentWarnings: FormControl<string>;
  }>;
  constructor(
    private readonly fb: FormBuilder,
    private readonly supabase: SupabaseService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.bookForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      genre: ['', Validators.required],
      seriesName: [''],
      shortDescription: [''],
      annotation: [''],
      contentWarnings: ['']
    });
  }
  async ngOnInit(): Promise<void> {
    try {
      const session = await this.supabase.getSession();
      if (!session) {
        this.errorMessage = 'Сессия не найдена.';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      this.applySession(session);
      await this.loadBooks();
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить кабинет автора.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
  showSection(section: AuthorSection): void {
    this.activeSection = section;
    this.errorMessage = '';
    this.successMessage = '';
  }
  async createBook(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }
    if (!this.session) {
      this.errorMessage = 'Сессия пользователя не найдена.';
      return;
    }
    this.savingBook = true;
    try {
      const form = this.bookForm.getRawValue();
      await this.supabase.createBook({
        userId: this.session.user.id,
        authorName: this.displayName,
        title: form.title.trim(),
        genre: form.genre,
        seriesName: form.seriesName.trim(),
        shortDescription: form.shortDescription.trim(),
        annotation: form.annotation.trim(),
        contentWarnings: form.contentWarnings.trim()
      });
      this.bookForm.reset({
        title: '',
        genre: '',
        seriesName: '',
        shortDescription: '',
        annotation: '',
        contentWarnings: ''
      });
      await this.loadBooks();
      this.successMessage = 'Книга создана.';
      this.activeSection = 'books';
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Не удалось создать книгу.';
    } finally {
      this.savingBook = false;
      this.cdr.detectChanges();
    }
  }
  async signOut(): Promise<void> {
    await this.supabase.signOut();
    window.location.href = '/login';
  }
  private async loadBooks(): Promise<void> {
    if (!this.session) {
      return;
    }
    this.books =
      await this.supabase.getBooksByUser(
        this.session.user.id
      );
  }
  private applySession(session: Session): void {
    this.session = session;
    this.email = session.user.email ?? '';
    this.displayName =
      session.user.user_metadata?.['display_name']?.trim() ||
      session.user.user_metadata?.['pen_name']?.trim() ||
      this.email ||
      'Автор TaleTom';
  }
}
