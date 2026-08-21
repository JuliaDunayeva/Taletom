# TaleTom Angular + Supabase

Стартовый фронтенд TaleTom.

## Что уже работает

- Angular standalone-приложение.
- Supabase client.
- Запрос автора `Крис Дурбин` из `authors`.
- Запрос связанных книг из `books` по `author_id`.
- Метод получения книги по `id`.
- Метод получения опубликованных глав из `chapters`.
- Карточки книг строятся из базы, а не зашиты в HTML.
- RLS SQL для публичного чтения лежит в `supabase/public-read-policies.sql`.

## 1. Supabase

Открой:

`src/environments/environment.ts`

и вставь:

- Project URL;
- **public / publishable / anon key**.

Никогда не помещай во frontend `service_role` или secret key.

## 2. RLS policies

В Supabase SQL Editor выполни содержимое:

`supabase/public-read-policies.sql`

Это оставляет RLS включённым и разрешает публично читать автора и каталог книг.
Для глав публично читаются только строки с `is_published = true`.

## 3. Обложки

Скопируй реальные файлы в:

`public/Images/Covers/`

Имена ожидаются те же, которые уже сохранены в `books.cover_url`.

## 4. Запуск

```bash
npm install
npm start
```

По умолчанию Angular откроется на:

`http://localhost:4200`

## 5. GitHub

Создай пустой репозиторий и загрузи содержимое этой папки.
После этого на другом компьютере:

```bash
git clone <URL-репозитория>
cd taletom-angular
npm install
npm start
```

`node_modules` в GitHub не загружается и уже включён в `.gitignore`.

## Важное

Этот проект использует Angular 21 LTS. Это намеренно: Angular 22 требует более новую ветку Node.js 22, а Angular 21 даёт более мягкую совместимость при всё ещё актуальной поддержке.

Следующий логичный шаг: добавить маршруты `/authors/:id`, `/books/:id` и reader для `chapters`.
