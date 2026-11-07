import os
import re
import json
import logging
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils import timezone
from scholarships.models import Scholarship
from ai_assistant.services import AIService

logger = logging.getLogger(__name__)

# Trusted sources to search regularly
SEARCH_QUERIES = [
    "fully funded scholarship bangladesh students 2026 application open",
    "DAAD scholarship Germany masters application open 2026",
    "MEXT Japanese government scholarship undergraduate masters 2026",
    "Chevening UK government scholarship 2026 apply now",
    "Turkiye burslari scholarship application open 2026",
    "Erasmus Mundus joint masters scholarship 2026 2027",
    "Swedish Institute scholarship global professionals 2026",
    "Australia Awards scholarship Bangladesh 2026",
]

class Command(BaseCommand):
    help = 'Auto-scrapes and finds latest scholarships via search and parses them via AI for admin review.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=3,
            help='Max number of new scholarships to discover and save in this run.'
        )

    def handle(self, *args, **options):
        limit = options['limit']
        self.stdout.write(self.style.NOTICE(f"Starting Auto-Scholarship Finder (Max: {limit})..."))

        added_count = 0

        for query in SEARCH_QUERIES:
            if added_count >= limit:
                break

            self.stdout.write(f"\nSearching for: '{query}'...")
            urls = self._find_candidate_urls(query)

            for url in urls:
                if added_count >= limit:
                    break

                # Skip if scholarship with same official_link already exists
                if Scholarship.objects.filter(official_link=url).exists():
                    self.stdout.write(f"  [Skipped - Already exists]: {url}")
                    continue

                self.stdout.write(f"  Fetching & analyzing: {url}...")
                scholarship_data = self._scrape_and_parse(url)

                if scholarship_data and scholarship_data.get('title'):
                    title = scholarship_data['title'].strip()
                    # Check title duplicate
                    if Scholarship.objects.filter(title__iexact=title).exists():
                        self.stdout.write(f"  [Skipped - Title exists]: {title}")
                        continue

                    # Deadline parsing
                    deadline_val = scholarship_data.get('deadline', '').strip() or None
                    if deadline_val:
                        try:
                            from datetime import datetime
                            deadline_val = datetime.strptime(deadline_val, '%Y-%m-%d').date()
                        except Exception:
                            deadline_val = None

                    scholarship = Scholarship.objects.create(
                        title=title[:255],
                        provider=scholarship_data.get('provider', '')[:255],
                        country=scholarship_data.get('country', 'Global')[:100],
                        amount=scholarship_data.get('amount', 'Fully Funded')[:255],
                        category=scholarship_data.get('category', 'International')[:100],
                        level=scholarship_data.get('level', 'Masters')[:100],
                        field=scholarship_data.get('field', 'General')[:100],
                        deadline=deadline_val,
                        description=scholarship_data.get('description', ''),
                        eligibility=scholarship_data.get('eligibility', ''),
                        official_link=url,
                        status='pending', # Always pending for Admin Review!
                        is_featured=False,
                    )
                    added_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  [+] Saved as Pending (ID: {scholarship.id}): {scholarship.title}"))

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully discovered and queued {added_count} new scholarships for Admin Review!"))

    def _find_candidate_urls(self, query):
        """
        Queries search engine to obtain direct scholarship circular links.
        """
        candidates = []
        try:
            # DuckDuckGo HTML Search
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
            res = requests.get(
                'https://html.duckduckgo.com/html/',
                params={'q': query},
                headers=headers,
                timeout=10
            )

            if res.status_code == 200:
                soup = BeautifulSoup(res.text, 'html.parser')
                links = soup.find_all('a', class_='result__url')
                for a in links:
                    href = a.get('href', '').strip()
                    if href:
                        # Normalize DDG redirect links if any
                        if 'uddg=' in href:
                            import urllib.parse
                            parsed_qs = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                            if 'uddg' in parsed_qs:
                                href = parsed_qs['uddg'][0]

                        if href.startswith('http') and not any(bad in href for bad in ['duckduckgo.com', 'google.com', 'facebook.com', 'youtube.com']):
                            candidates.append(href)
                            if len(candidates) >= 3:
                                break
        except Exception as e:
            logger.warning(f"Search fetch failed: {e}")

        return candidates

    def _scrape_and_parse(self, url):
        """
        Fetches webpage and prompts AI to structure it.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            resp = requests.get(url, headers=headers, timeout=12)
            if resp.status_code != 200:
                return None

            soup = BeautifulSoup(resp.content, 'html.parser')
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'noscript', 'svg']):
                tag.decompose()

            raw_text = ' '.join(soup.stripped_strings)[:7000]
            if len(raw_text) < 100:
                return None

            prompt = (
                "Extract structured scholarship information from the scraped webpage text below. "
                "Respond ONLY with a valid raw JSON object (no markdown, no quotes around JSON). "
                "Use keys: \"title\", \"provider\", \"country\", \"amount\", \"category\", \"level\", \"field\", \"deadline\" (YYYY-MM-DD or empty), \"description\", \"eligibility\".\n"
                f"Webpage Content:\n{raw_text}\n"
            )

            ai_res = AIService._call_ai(prompt)
            clean_json = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', ai_res, flags=re.DOTALL).strip()
            return json.loads(clean_json)
        except Exception as e:
            logger.warning(f"Failed to scrape {url}: {e}")
            return None
