This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run main
# or
yarn main
# or
pnpm main
# or
bun main
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
```
Порядок роботи з GitHub
1. Створюєте нову гілку від main:
git checkout main
git pull origin main
git checkout -b feature/abc123

2. Робите зміни у своїй гілці
git add .
git commit -m "Короткий опис змін (ТЗ, задача тощо)"

3. Перед відправкою оновлюєте dev і робите rebase:
git checkout main
git pull origin main
git checkout feature/abc123
git rebase main

4. Перевіряєте, що все працює:
- Код компілюється / білд збирається
- Зміни на місці

5. Відправляєте свою гілку в репозиторій:
git push --force-with-lease origin feature/abc123

6. Створюєте Merge Request (Pull Request) у main
- У полі “Merge method” вибираєте “Squash and merge”
Перейди на GitHub
- Відкрий репозиторій → вкладка Pull Requests (GitHub) або Merge Requests (GitLab)
- Натисни “New Pull Request” або “Create Merge Request”

- Після мерджу можна видалити свою гілку
```
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
