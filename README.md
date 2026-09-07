# Редактор изображений

Веб-приложение для обработки изображений. Курс лабораторных работ.

## Стек

- React 18 + TypeScript
- Material UI 6
- Vite 6
- ESLint 9 + Prettier 3

## Требования

Node.js 22 (версия зафиксирована в `.nvmrc`), yarn 1.

## Запуск

```bash
nvm use
yarn install
yarn dev
```

## Команды

| Команда             | Назначение                                  |
| ------------------- | ------------------------------------------- |
| `yarn dev`          | Дев-сервер на `http://localhost:5173`       |
| `yarn build`        | Проверка типов и production-сборка в `dist` |
| `yarn preview`      | Локальный просмотр production-сборки        |
| `yarn lint`         | Проверка ESLint                             |
| `yarn lint:fix`     | Проверка ESLint с автоисправлением          |
| `yarn format`       | Форматирование Prettier                     |
| `yarn format:check` | Проверка форматирования                     |
| `yarn typecheck`    | Только проверка типов                       |

## Структура

```
src/
  app/       конфигурация приложения: тема, провайдеры
  shared/    переиспользуемые компоненты и утилиты
  App.tsx    корневой компонент
  main.tsx   точка входа
```

## Деплой

Сборка публикуется на GitHub Pages автоматически при пуше в `main`
(workflow `.github/workflows/deploy.yml`). Базовый путь задаётся
параметром `base` в `vite.config.ts` и должен совпадать с именем репозитория.
