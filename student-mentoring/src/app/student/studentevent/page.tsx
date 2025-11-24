// 'use client';

// import { useState, useEffect } from 'react';
// import { FiCalendar, FiMapPin, FiExternalLink } from 'react-icons/fi';

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   start: string;
//   end: string;
//   location: string;
//   type: string;
//   url?: string;
// }

// export default function StudentEvents() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [location, setLocation] = useState('Bangalore');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const fetchEvents = async (searchLocation: string) => {
//     if (!searchLocation.trim()) {
//       setError('Please enter a location');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');

//       console.log('Fetching events for location:', searchLocation);

//       const res = await fetch(`http://localhost:8000/api/events/realtime?location=${encodeURIComponent(searchLocation)}`);
      
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || 'Failed to fetch events');
//       }

//       const data = await res.json();
//       console.log('API Response:', data);

//       if (data.success) {
//         setEvents(data.data || []);
//         if (data.data.length === 0) {
//           setError('No events found for this location. Try a different city or region.');
//         }
//       } else {
//         throw new Error(data.message || 'Failed to fetch events');
//       }
//     } catch (error) {
//       console.error('Failed to fetch events:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch events');
//       setEvents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Auto-fetch events on component mount
//   useEffect(() => {
//     fetchEvents(location);
//   }, []); // Empty dependency array to run only once

//   const handleSearch = () => {
//     fetchEvents(location);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//  // Corrected function in your frontend component
// const getEventColor = (type: string) => {
//   const lowerType = type?.toLowerCase() || ''; // Added null check and proper casing
//   switch (lowerType) {
//     case 'hackathon': return 'bg-purple-100 text-purple-800';
//     case 'workshop': return 'bg-blue-100 text-blue-800';
//     case 'seminar': return 'bg-green-100 text-green-800';
//     case 'conference': return 'bg-yellow-100 text-yellow-800';
//     default: return 'bg-gray-100 text-gray-800';
//   }
// };
//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         weekday: 'short',
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch {
//       return 'Date TBD';
//     }
//   };

//   const formatTime = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true
//       });
//     } catch {
//       return '';
//     }
//   };

//   return (
//     <div className="p-4 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//         <FiCalendar /> Upcoming Tech Events
//       </h2>

//       {/* Location Filter */}
//       <div className="flex gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Enter location (e.g., Bangalore, Mumbai, Delhi)..."
//           className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={location}
//           onChange={(e) => setLocation(e.target.value)}
//           onKeyPress={handleKeyPress}
//         />
//         <button
//           onClick={handleSearch}
//           disabled={loading || !location.trim()}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Loading State */}
//       {loading && (
//         <div className="text-center py-8">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <p className="mt-2 text-gray-600">Searching for events...</p>
//         </div>
//       )}

//       {/* Events List */}
//       <div className="space-y-3">
//         {!loading && events.length === 0 && !error ? (
//           <div className="text-center py-8">
//             <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <p className="text-gray-500">No upcoming events found for "{location}"</p>
//             <p className="text-sm text-gray-400 mt-1">Try searching for a different location</p>
//           </div>
//         ) : (
//           events.map((event) => (
//             <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
//               <div className="flex justify-between items-start mb-2">
//                 <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
//                 <span className={`px-2 py-1 text-xs rounded-full ${getEventColor(event.type)}`}>
//                   {event.type}
//                 </span>
//               </div>
              
//               {event.description && (
//                 <p className="text-sm text-gray-600 mb-3 line-clamp-3">{event.description}</p>
//               )}

//               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
//                 <span className="flex items-center">
//                   <FiMapPin className="mr-1" /> {event.location}
//                 </span>
//                 <span className="flex items-center">
//                   <FiCalendar className="mr-1" /> {formatDate(event.start)}
//                 </span>
//                 {event.start && (
//                   <span>
//                     {formatTime(event.start)}
//                     {event.end && ` - ${formatTime(event.end)}`}
//                   </span>
//                 )}
//               </div>

//               {event.url && (
//                 <a
//                   href={event.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center text-blue-600 text-sm hover:underline"
//                 >
//                   <FiExternalLink className="mr-1" /> View Event Details
//                 </a>
//               )}
//             </div>
//           ))
//         )}
//       </div>

//       {/* Quick Location Buttons */}
//       <div className="mt-4 pt-4 border-t">
//         <p className="text-sm text-gray-600 mb-2">Quick search:</p>
//         <div className="flex flex-wrap gap-2">
//           {['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map((city) => (
//             <button
//               key={city}
//               onClick={() => {
//                 setLocation(city);
//                 fetchEvents(city);
//               }}
//               className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
//             >
//               {city}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }