'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
  source: string;
  isFree: boolean;
  category: string;
  platform: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const PYTHON_SCRAPER_URL = 'http://localhost:5001'; // Direct Python server

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setShowManualInput(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get city name from coordinates
        const cityName = await getCityName(latitude, longitude);
        
        setLocation({
          lat: latitude,
          lng: longitude,
          name: cityName
        });
        setLoading(false);
      },
      () => {
        setError('Unable to get location');
        setShowManualInput(true);
        setLoading(false);
      }
    );
  };

  const getCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.state || 'Your Area';
    } catch {
      return 'Your Location';
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Geocode the manual location
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=json&limit=1`
      );
      const geoData = await geoResponse.json();
      
      if (geoData && geoData.length > 0) {
        setLocation({
          lat: parseFloat(geoData[0].lat),
          lng: parseFloat(geoData[0].lon),
          name: manualLocation
        });
        setShowManualInput(false);
      } else {
        setError('Location not found. Please try again.');
      }
    } catch {
      setError('Failed to find location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchEvents();
    }
  }, [location]);

 const fetchEvents = async () => {
  if (!location) return;
  
  setLoading(true);
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/scrape-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        location: location.name,
        event_type: 'offline'  // This filters for offline events only!
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setEvents(data.events);
    } else {
      setError(data.error);
    }
  } catch (err) {
    setError('Failed to connect to Python scraper');
  } finally {
    setLoading(false);
  }
};

  const formatDate = (dateStr: string): string => {
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎓 Student Tech Events
          </h1>
          <p className="text-gray-600">
            Hackathons & competitions from Unstop, Devfolio & HackerEarth
          </p>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              {location ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-500">
                      {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Click below to get your location</p>
              )}
            </div>
            
            <button
              onClick={getLocation}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Getting Location...' : '📍 Get My Location'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setShowManualInput(true)}
                className="text-sm text-blue-600 mt-1 hover:underline"
              >
                Enter location manually →
              </button>
            </div>
          )}
          
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter city name (e.g., Bangalore, Mysore)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Finding events near you...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try a different location or check back later</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {events.length} event{events.length !== 1 ? 's' : ''} from student platforms
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event, formatDate }: { event: Event; formatDate: (date: string) => string }) {
  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'Unstop': return 'bg-purple-100 text-purple-700';
      case 'Devfolio': return 'bg-blue-100 text-blue-700';
      case 'HackerEarth': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="p-5">
        {/* Platform Badge */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPlatformColor(event.platform)}`}>
            {event.platform}
          </span>
          {event.isFree && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
              🎓 FREE
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {event.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description || 'Join this exciting tech event for students!'}
        </p>
        
        {/* Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>📍</span>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 text-xs">
            <span>🎯</span>
            <span>{event.source}</span>
          </div>
        </div>
        
        {/* Register Button */}
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
        >
          Register Now →
        </a>
      </div>
    </div>
  );
}