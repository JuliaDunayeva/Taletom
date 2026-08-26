import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Session } from '@supabase/supabase-js';

import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';

  session: Session | null = null;

  loading = false;
  message = '';
  errorMessage = '';

  readonly form: FormGroup<{
    displayName: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    passwordConfirm: FormControl<string>;
  }>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly supabase: SupabaseService,
    private readonly router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      displayName: [''],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      passwordConfirm: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.session = await this.supabase.getSession();

      this.supabase.onAuthStateChange((session) => {
        this.session = session;
      });
    } catch (error: unknown) {
      this.errorMessage = this.getErrorMessage(error);
    }
  }


  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;

    this.clearMessages();

    this.form.controls.displayName.setErrors(null);
    this.form.controls.passwordConfirm.setErrors(null);
  }

  async submit(): Promise<void> {
    this.clearMessages();

    const displayName =
      this.form.controls.displayName.value.trim();

    const email =
      this.form.controls.email.value.trim();

    const password =
      this.form.controls.password.value;

    const passwordConfirm =
      this.form.controls.passwordConfirm.value;

    if (this.mode === 'register') {
      if (!displayName) {
        this.form.controls.displayName.setErrors({
          required: true
        });
      }

      if (!passwordConfirm) {
        this.form.controls.passwordConfirm.setErrors({
          required: true
        });
      } else if (password !== passwordConfirm) {
        this.form.controls.passwordConfirm.setErrors({
          passwordMismatch: true
        });
      }
    }

    if (
      this.form.controls.email.invalid ||
      this.form.controls.password.invalid ||
      (
        this.mode === 'register' &&
        (
          this.form.controls.displayName.invalid ||
          this.form.controls.passwordConfirm.invalid
        )
      )
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      if (this.mode === 'register') {
        const response = await this.supabase.signUp(
          displayName,
          email,
          password
        );

        if (response.error) {
          throw response.error;
        }

        if (response.data.session) {
          this.session = response.data.session;

          await this.router.navigateByUrl('/author');
        } else {
          this.message =
            'Аккаунт создан. Проверьте почту и подтвердите регистрацию.';
        }
      } else {
        const response = await this.supabase.signIn(
          email,
          password
        );

        if (response.error) {
          throw response.error;
        }

        this.session = response.data.session;

        await this.router.navigateByUrl('/author');
      }
    } catch (error: unknown) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async resetPassword(): Promise<void> {
    this.clearMessages();

    const email =
      this.form.controls.email.value.trim();

    if (
      !email ||
      this.form.controls.email.invalid
    ) {
      this.form.controls.email.markAsTouched();

      this.errorMessage =
        'Введите корректный email.';

      return;
    }

    this.loading = true;

    try {
      await this.supabase.resetPassword(email);

      this.message =
        'Ссылка для восстановления пароля отправлена на почту.';
    } catch (error: unknown) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async signOut(): Promise<void> {
    this.clearMessages();

    this.loading = true;

    try {
      await this.supabase.signOut();

      this.session = null;

      this.form.reset({
        displayName: '',
        email: '',
        password: '',
        passwordConfirm: ''
      });

      this.mode = 'login';

      this.message =
        'Вы вышли из аккаунта.';
    } catch (error: unknown) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

  private getErrorMessage(
    error: unknown
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Что-то пошло не так. Попробуйте ещё раз.';
  }
}

