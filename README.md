# Français A1 — Hub

Інтерактивний каркас для курсу французької A1 (за структурою Sommaire підручника): логін по ніку,
навігація по 11 юнітах (Unité 0–10), кожен з розділами Leçon / Bilan linguistique / DELF A1,
трекінг статусу та балів на Supabase.

## Структура репозиторію

```
index.html        Sommaire — головна сторінка з навігацією (потребує логіну)
login.html         Вхід по ніку
unit.html          Сторінка юніта (динамічна, ?id=0..10)
css/style.css       Стилі
js/supabaseClient.js  Підключення до Supabase (URL + публічний anon-ключ)
js/auth.js            Логін-гард + шапка сторінки
js/sommaire.js         Логіка головної сторінки
js/unit.js              Логіка сторінки юніта
```

## Supabase

Проєкт **french-a1-hub** вже створено (organization: villevian's Org, регіон eu-west-3, free tier, €0/міс).

- URL: `https://skdsvvtcbbzlbqtudbcg.supabase.co`
- Публічний anon-ключ вже прописаний у `js/supabaseClient.js` — його можна тримати в клієнтському коді,
  доступ обмежено RLS-політиками.

Таблиці:
- `units` — 11 юнітів, кольори, діапазони сторінок (заповнено з Sommaire)
- `sections` — Leçon / Bilan linguistique / DELF A1 для кожного юніту
- `students` — учні за ніком (без пароля, легкий вхід для класу)
- `progress` — статус (`not_started` / `in_progress` / `completed`) і бал по кожному розділу для кожного учня

Щоб подивитись/змінити дані напряму — Supabase Dashboard → Table Editor, проєкт `french-a1-hub`.

## Деплой на GitHub Pages

1. Створи новий репозиторій на GitHub (наприклад `french-a1-hub`), без README/gitignore (щоб не було конфліктів).
2. У теці проєкту:
   ```bash
   git init
   git add .
   git commit -m "Initial scaffold: Sommaire + login + unit tracking"
   git branch -M main
   git remote add origin https://github.com/<твій-нік>/french-a1-hub.git
   git push -u origin main
   ```
3. На GitHub: Settings → Pages → Source: `Deploy from a branch`, гілка `main`, тека `/ (root)`.
4. Через хвилину-дві сайт буде доступний на `https://<твій-нік>.github.io/french-a1-hub/`.

## Що далі (наступні кроки, не зроблено зараз)

- Наповнення контентом самих юнітів (зараз лише статус/бал — placeholder під вправи)
- Окрема сторінка для перегляду прогресу всіх учнів одразу (зараз кожен бачить лише свій)
- Реальна перевірка автентичності ніка (зараз будь-хто може зайти під будь-яким ніком — ок для класу,
  але варто знати обмеження)
