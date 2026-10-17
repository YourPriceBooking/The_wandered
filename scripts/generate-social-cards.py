"""Regenerate checked-in social PNGs: python -m pip install Pillow; python scripts/generate-social-cards.py."""
from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / 'src/styles/fonts/sen/Sen-VariableFont_wght.ttf'
CARDS = {
    'home': ('THE TRAVEL JOURNAL', 'Stories for curious travelers', 'Places. People. New perspectives.'),
    'ukraine': ('УКРАЇНА', 'Подорожі Україною', 'Міста, природа та нові маршрути'),
    'poland': ('POLSKA', 'Podróże po Polsce', 'Miasta, natura i ciekawe trasy'),
    'usa': ('USA', 'A little further. A new discovery.', 'Road trips, cities and national parks'),
    'canada': ('CANADA', 'Wild landscapes. Open roads.', 'Cities, lakes and remarkable places'),
    'australia': ('AUSTRALIA', 'Follow the coast. Find a story.', 'Road trips, cities and new perspectives'),
    'singapore': ('SINGAPORE', 'A city with stories to tell.', 'Culture, neighborhoods and local tips'),
    'uncharted-planet': ('UNCHARTED PLANET', 'Ancient places. Open questions.', 'Civilizations, mysteries and remote places'),
    'journal': ('THE COMPANY JOURNAL', 'The Your Price Booking journey', 'Milestones, ideas and stories along the way'),
    'new-episodes': ('NEW EPISODES', 'The story continues.', 'Fresh updates from Your Price Booking'),
    'travel-resources': ('TRAVEL RESOURCES', 'Your window to the world.', 'Live flights / Weather / News / Maps'),
    'privacy': ('PRIVACY POLICY', 'Your privacy, explained.', 'How information is handled on The Wandered'),
    'search': ('EXPLORE THE JOURNAL', 'Find your next travel story.', 'Destinations, discoveries and practical tips'),
    'article-en': ('THE TRAVEL JOURNAL', 'Every journey has a story.', 'Discover it on The Wandered'),
    'article-uk': ('ІСТОРІЇ ПРО ПОДОРОЖІ', 'У кожної подорожі є історія.', 'Відкривайте її з The Wandered'),
    'article-pl': ('HISTORIE Z PODRÓŻY', 'Każda podróż ma swoją historię.', 'Odkrywaj ją z The Wandered'),
}
CYRILLIC_FONT = Path(os.environ.get('SOCIAL_CYRILLIC_FONT', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
active_font = FONT
def font(size):
    return ImageFont.truetype(str(active_font), size)
def lines(draw, text, face, width):
    result, current = [], ''
    for word in text.split():
        candidate = f'{current} {word}'.strip()
        if current and draw.textlength(candidate, font=face) > width:
            result.append(current); current = word
        else:
            current = candidate
    return result + [current]
for key, (eyebrow, heading, subtitle) in CARDS.items():
    # The bundled Sen font has no Cyrillic glyphs. Rasterize Ukrainian with DejaVu Sans.
    active_font = CYRILLIC_FONT if key in ('ukraine', 'article-uk') else FONT
    image = Image.new('RGB', (1200, 630), '#fff9ef'); d = ImageDraw.Draw(image)
    d.rectangle((0, 0, 1200, 14), fill='#ff6b19')
    d.text((68, 58), 'the wandered', font=font(40), fill='#22251f')
    d.line((68, 127, 1132, 127), fill='#ff6b19', width=3)
    d.text((68, 166), eyebrow, font=font(24), fill='#9a3e0c')
    face = font(66)
    for i, line in enumerate(lines(d, heading, face, 1030)):
        d.text((64, 214 + i * 79), line, font=face, fill='#22251f')
    d.text((68, 427), subtitle, font=font(29), fill='#555a50')
    d.rounded_rectangle((68, 526, 351, 574), radius=24, fill='#ff6b19')
    d.text((88, 535), 'thewandered.com', font=font(25), fill='#22251f')
    d.line((396, 550, 1082, 550), fill='#c8c9b3', width=2)
    d.ellipse((1094, 535, 1124, 565), outline='#687454', width=3)
    image.save(ROOT / f'public/social/{key}.png', optimize=True)
