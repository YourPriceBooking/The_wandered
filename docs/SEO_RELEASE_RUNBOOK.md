# SEO: приймання релізу та моніторинг

База PR: main `cb1bdac`, PR #282 merged. Цей етап додає read-only перевірку
публічних HTTP-відповідей, а не деплой чи підтвердження індексації Google.

## Виправлення червоного CI #282

GitHub run `39025357477`, job `117375160930`: build, TypeScript і 55 unit tests
пройшли; HTTP — 52/53. Помилка: `Non-article initial CSS budget`.

На чистому `npm ci` + Node 20.20.2 відтворено ту саму помилку. Початковий CSS
головної — 66 547 bytes, tools — 67 808 bytes; Quill відсутній у них і збережений
у статті. Звіт: `performance/clean-ci-main.json`. Попередні 52 591 bytes отримані
в іншому локальному checkout зі спільним node_modules. Групування CSS-чанків
відрізняється; старий поріг 60 000 не був придатним для чистої CI-збірки.
Це коригує інтерпретацію замірів #282: вони не універсальні для будь-якого checkout.

HTTP-тест рахує унікальні stylesheet URL, має поріг 75 000 bytes на двох
контрольних маршрутах та друкує actual bytes/URL при помилці. Незалежні перевірки
відсутності Quill, WOFF2 та наявності стилів редактора у статтях лишаються.
CI зберігає HTTP test log, server log і останній fixture HTML на 7 днів.
Build більше не має `ignoreBuildErrors`: TypeScript перевіряється самим build і
окремою CI-командою. Загальний legacy ESLint ще пропускається під час build;
нові audit scripts/tests проходять окремий ESLint без зламаного legacy config.

## Автоматизоване read-only приймання production

З установленими залежностями, без запуску локального сервера:

```sh
npm ci
npm run seo:audit-release
```

За замовчуванням ціль фіксована: `https://www.thewandered.com`. Список URL береться
з живого `/sitemap.xml`, включно з sitemap index. Output — `seo-release-report.json`
(не комітиться автоматично). Exit 0 — усі перевірки заявленого обсягу пройшли,
exit 1 — помилка/збій/вичерпаний бюджет. Звіт містить coverage, окремі URL/errors,
HTTP status, elapsed observations, image headers/dimensions і redirect chains.

Швидка **явна вибірка**, яка не оголошується повним обходом:

```sh
SEO_AUDIT_MAX_PAGES=20 SEO_AUDIT_OUTPUT=/tmp/seo-sample.json npm run seo:audit-release
```

`mode=sample` залишається у звіті навіть коли всі перевірені URL пройшли.
`complete` позначає повноту HTTP-обходу сторінок sitemap, не індексацію чи
справність усіх ресурсів. Дивитися також `passed`, `issues`, `checkedImages`.
При sample exit 0 не означає повне приймання сайту.

Після мерджу доступний GitHub Actions → **Production SEO release audit** →
**Run workflow**. `max_pages=0` — весь sitemap, позитивне число — вибірка.
Workflow лише ручний: cron, повідомлення іншим людям і деплой не додаються.
JSON-артефакт зберігається 30 днів, зокрема при негативному результаті.

Перевірки:

- robots HTTP 200, canonical sitemap directive, сигнал повного Disallow для
  Googlebot/загального user-agent. Складні Allow/Disallow та per-path правила
  не вважаються повністю змодельованими; їх треба звірити окремо.
- Sitemap: XML/MIME/namespace, ampersands, same-origin canonical URL, відсутність
  дублікатів, циклів і службових query/hash. Лічильник не може впасти нижче
  перевіреного seed + 15 статичних сторінок (зараз 157). Легітимне видалення
  потребує звірки й оновлення baseline, а не приховування попередження.
- Усі вибрані sitemap URL: HTTP 200 без редиректу, HTML, один H1, title/description,
  self canonical, lang uk/pl/en, відсутність noindex у HTML/X-Robots-Tag.
- Повні OG/Twitter поля, локаль, абсолютні HTTPS image URL/alt і заявлені розміри.
  Унікальні social images отримуються окремо: HTTP/MIME/magic header, фактичні
  dimensions PNG/JPEG 1200×630. Це перевірка заголовків зображення, не повний decode.
  Дозволені лише site origin і res.cloudinary.com; новий CDN треба додати явно.
- Пошук — 200/noindex, штучна відсутня стаття — 404/noindex; статус 500 не маскується.
- HTTP/HTTPS, www/non-www, trailing slash tools: постійні 301/308 на canonical 200,
  не більше трьох переходів, без циклів/переходу на сторонній домен.
- JSON-LD має валідний JSON. Семантику schema додатково захищають тести етапу 5;
  Google Rich Results Test і Schema Markup Validator залишаються зовнішнім прийманням.

Обмеження навантаження: до двох одночасних запитів у HTML/image фазах (максимальна конфігурація — 4),
20 s timeout, 8 min загальний бюджет плюс завершення поточного bounded запиту,
до 1000 URL/20 sitemap files, 8 MiB HTML/XML і 4 MiB image на відповідь. При
вичерпанні лімітів — негативний звіт, не зелений результат часткового обходу.
Жодних retries, які приховують одиничні 5xx. Timings — спостереження, не TTFB/CWV.

## Знайдено на production до цього PR

Повторний full audit вклався у 115 693 ms: 157/157 сторінок — HTTP 200 із
належними початковими metadata, 157/157 social images — HTTP 200, правильні
MIME/magic і 1200×630. Search/missing і www HTTP/trailing slash checks пройшли.
Summary: `seo-release/production-before-host-fix.json`.

Звіт має `passed=false`: bare `https://thewandered.com/` віддає 200, а
`http://thewandered.com/` веде на цей bare HTTPS host замість www. Це дві
підтверджені variant помилки, не 97 проблем зображень: попередня спроба
з послідовною image-фазою витратила бюджет після 66 успішних images.

Додано Next config host-specific permanent 308: `thewandered.com` →
`https://www.thewandered.com`, path/query зберігаються; canonical www і localhost
не перенаправляються. HTTP-тест охоплює homepage, localized path, encoded article
slug, повторні query, robots і favicon. Оскільки nginx стоїть перед Next,
після деплою слід підтвердити ці редиректи на публічному хості; якщо proxy
переписує Host або сам віддає контент, правило canonical host потрібне в nginx.
Деплой/nginx цим PR не виконується.

Локально на чистому npm ci / Node 20: build із TS gate, окремий TypeScript,
scoped ESLint, 65 unit + 54 HTTP = 119 тестів.

## Порядок випуску на вашому сервері

1. Переконатися, що PR checks зелені; звірити commit/версію Node на сервері та
   звичним для вашого PM2 процесом виконати deployment. Цей PR сервер не змінює.
2. Запустити full audit проти production; зберегти JSON/Actions artifact і SHA
   випущеного frontend. Негативні статуси розділити на frontend, API, CDN та nginx.
3. Якщо canonical redirects не пройшли — звірити vhost/HTTPS/nginx конфігурацію:
   це не виправляється лише Next metadata. Backend cold list latency також не
   вважається усуненою коротким кешем.
4. На desktop/телефоні перевірити початкове відображення та клієнтську навігацію,
   Back/Forward/scroll restoration, shy-header, ScrollToTop, підказки, чотири tools,
   пошук у футері й статті. HTML-аудит не виконує JS і не підтверджує ці взаємодії.
5. Перевірити staging/preview окремо: auth або noindex; URL staging у репо не задано,
   довільні хости скрипт не перевіряє. Немає підстав оголошувати захист підтвердженим.
6. Search Console: подати sitemap після успішного HTTP-приймання, URL Inspection
   для головної, uk/pl, статей, authors та pagination; звірити canonical Google,
   rendered HTML, Page Indexing. Пошук і missing не повинні індексуватися.
7. Після переобходу порівняти кліки/покази й причини виключення. Окремо польові
   CWV p75 та mobile Lighthouse/WebPageTest. Досягнення цілей без даних не заявляти.

## Моніторинг і реакція

Запускати той самий full audit після деплою та для повторних перевірок стану.
Старий JSON/Actions artifact — baseline для порівняння counts/status/latency.
Розклад можна додати окремо, коли узгоджено частоту й канал сповіщень.

- 404 у sitemap: звірити публікацію/видалення, прибрати URL лише після підтвердження.
- 5xx/timeout: перевірити API/Node/nginx; це не missing і не привід обрізати sitemap.
- Різке падіння URL count: перевірити повноту inventory/snapshots за
  SEO_ARCHIVE_OPERATIONS.md; не перезаписувати повний snapshot частковими даними.
- Image HTTP/MIME/dimensions: перевірити CDN URL і fallback, кеш соцплатформ.
- Unexpected noindex/canonical/lang: блокувати приймання релізу до виправлення.
- Вичерпаний бюджет/мережевий збій: повторити з сервера/Actions, зберегти обидва
  результати; це не доказ поломки production і не підтвердження успішного обходу.

Залишок усієї програми: пристрої/JS, Google validators/Search Console/CWV,
підтвердження редакційних правил, staging/server redirects, cold API latency,
реальні dimensions body images та за потреби міжпроцесна invalidation кешу.
Ці пункти не закриваються самим мерджем коду.

Довідка: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[robots.txt](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec),
[HTTP statuses](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes).
