from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)
CORS(app)

def scrape_unstop_events(location=None):
    """Scrape ALL events from Unstop"""
    events = []
    
    try:
        url = "https://unstop.com/hackathons"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all event cards
        event_elements = soup.find_all('div', class_='opportunity-card') or \
                        soup.find_all('div', class_='card') or \
                        soup.find_all('article')
        
        print(f"Found {len(event_elements)} total Unstop events")
        
        # NO LIMIT - Get ALL events
        for elem in event_elements:
            try:
                title = None
                for tag in ['h3', 'h2', 'h1']:
                    title_elem = elem.find(tag)
                    if title_elem:
                        title = title_elem.text.strip()
                        break
                
                if not title:
                    continue
                
                # Get location
                location_text = "Online/Offline"
                location_elem = elem.find(text=re.compile(r'Location|Venue|Online|Offline|Hybrid|Bangalore|Mumbai|Delhi|Pune|Chennai|Hyderabad', re.I))
                if location_elem:
                    location_text = location_elem if isinstance(location_elem, str) else location_elem.text
                
                # Get link
                link = ""
                link_elem = elem.find('a')
                if link_elem and link_elem.get('href'):
                    link = link_elem.get('href')
                    if not link.startswith('http'):
                        link = f"https://unstop.com{link}"
                
                events.append({
                    'id': f'unstop_{len(events)}',
                    'title': title,
                    'description': "",
                    'date': "Check website",
                    'location': location_text,
                    'url': link,
                    'source': 'Unstop',
                    'isFree': True,
                    'category': 'Hackathon',
                    'platform': 'Unstop'
                })
                
            except Exception as e:
                print(f"Error parsing Unstop event: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Unstop: {e}")
    
    return events

def scrape_devfolio_events(location=None):
    """Scrape ALL events from Devfolio"""
    events = []
    
    try:
        url = "https://devfolio.co/hackathons"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all hackathon cards
        event_elements = soup.find_all('div', class_='sc-1kmz2b6-0') or \
                        soup.find_all('div', class_='hackathon-card') or \
                        soup.find_all('a', href=True)
        
        print(f"Found {len(event_elements)} total Devfolio events")
        
        # NO LIMIT - Get ALL events
        for elem in event_elements:
            try:
                title = None
                title_elem = elem.find('h3') or elem.find('h2')
                if title_elem:
                    title = title_elem.text.strip()
                
                if not title:
                    continue
                
                location_text = "Online"
                if 'offline' in elem.text.lower():
                    location_text = "Offline"
                elif 'hybrid' in elem.text.lower():
                    location_text = "Hybrid"
                
                link = ""
                link_elem = elem.find('a') if elem.name != 'a' else elem
                if link_elem and link_elem.get('href'):
                    link = link_elem.get('href')
                    if not link.startswith('http'):
                        link = f"https://devfolio.co{link}"
                
                events.append({
                    'id': f'devfolio_{len(events)}',
                    'title': title,
                    'description': "",
                    'date': "Check website",
                    'location': location_text,
                    'url': link,
                    'source': 'Devfolio',
                    'isFree': True,
                    'category': 'Hackathon',
                    'platform': 'Devfolio'
                })
                
            except Exception as e:
                print(f"Error parsing Devfolio event: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Devfolio: {e}")
    
    return events

def scrape_hackerearth_events(location=None):
    """Scrape ALL events from HackerEarth"""
    events = []
    
    try:
        url = "https://www.hackerearth.com/challenges/hackathon/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all challenge cards
        challenge_cards = soup.find_all('div', class_='challenge-card') or \
                         soup.find_all('div', class_='card')
        
        print(f"Found {len(challenge_cards)} total HackerEarth events")
        
        # NO LIMIT - Get ALL events
        for challenge in challenge_cards:
            try:
                title_elem = challenge.find('h3') or challenge.find('div', class_='title')
                title = title_elem.text.strip() if title_elem else "No title"
                
                if title == "No title":
                    continue
                
                desc_elem = challenge.find('p')
                description = desc_elem.text.strip()[:200] if desc_elem else ""
                
                link_elem = challenge.find('a')
                link = link_elem.get('href') if link_elem else ""
                if link and not link.startswith('http'):
                    link = f"https://www.hackerearth.com{link}"
                
                events.append({
                    'id': f'hackerearth_{len(events)}',
                    'title': title,
                    'description': description,
                    'date': "Registration Open",
                    'location': "Online",
                    'url': link,
                    'source': 'HackerEarth',
                    'isFree': True,
                    'category': 'Hackathon',
                    'platform': 'HackerEarth'
                })
                
            except Exception as e:
                print(f"Error parsing HackerEarth event: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping HackerEarth: {e}")
    
    return events

@app.route('/scrape-events', methods=['POST'])
def scrape_events():
    try:
        data = request.get_json()
        location = data.get('location', '')
        
        print(f"Scraping ALL events for location: {location}")
        
        all_events = []
        
        # Scrape all from each platform
        print("Scraping Unstop...")
        unstop_events = scrape_unstop_events(location)
        all_events.extend(unstop_events)
        print(f"Unstop: {len(unstop_events)} events")
        
        print("Scraping Devfolio...")
        devfolio_events = scrape_devfolio_events(location)
        all_events.extend(devfolio_events)
        print(f"Devfolio: {len(devfolio_events)} events")
        
        print("Scraping HackerEarth...")
        hackerearth_events = scrape_hackerearth_events(location)
        all_events.extend(hackerearth_events)
        print(f"HackerEarth: {len(hackerearth_events)} events")
        
        # Remove duplicates
        seen_titles = set()
        unique_events = []
        for event in all_events:
            title_lower = event['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_events.append(event)
        
        print(f"\n📊 TOTAL: {len(unique_events)} unique events found")
        print(f"  - Unstop: {len(unstop_events)}")
        print(f"  - Devfolio: {len(devfolio_events)}")
        print(f"  - HackerEarth: {len(hackerearth_events)}")
        
        return jsonify({
            'success': True,
            'events': unique_events,
            'count': len(unique_events),
            'platform_counts': {
                'unstop': len(unstop_events),
                'devfolio': len(devfolio_events),
                'hackerearth': len(hackerearth_events)
            },
            'location_used': location
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)