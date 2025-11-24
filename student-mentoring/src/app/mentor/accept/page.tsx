'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function MentorJoinPage() {
  const [roomId, setRoomId] = useState('');
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const router = useRouter();

  const handleJoinMeeting = () => {
    if (!roomId.trim()) return;
    setIsInMeeting(true);
    setSessionTime(0);
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    setParticipantCount(0);
    setSessionTime(0);
    router.push('/mentor/dashboard');
  };

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInMeeting) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInMeeting]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isInMeeting || !roomId || !isApiReady) return;

    const initializeJitsi = () => {
      try {
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomId.trim(),
          width: '100%',
          height: '600px',
          parentNode: document.querySelector('#jitsi-container'),
          userInfo: { 
            displayName: 'Mentor',
            email: '',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableSimulcast: false,
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        api.executeCommand('subject', 'Student-Mentor Session');

        api.addEventListeners({
          readyToClose: handleLeaveMeeting,
          participantJoined: (data: any) => {
            setParticipantCount(prev => prev + 1);
            if (data.displayName === 'Student') {
              console.log('Student has joined!');
            }
          },
          participantLeft: () => {
            setParticipantCount(prev => Math.max(0, prev - 1));
            console.log('Participant left');
          }
        });

        return () => {
          api.dispose();
        };
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        handleLeaveMeeting();
      }
    };

    return initializeJitsi();
  }, [isInMeeting, roomId, isApiReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Script 
        src="https://meet.jit.si/external_api.js" 
        strategy="lazyOnload"
        onLoad={() => setIsApiReady(true)}
        onError={() => console.error('Failed to load Jitsi API')}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Mentor Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isInMeeting && (
                <>
                  <div className="text-sm text-gray-500">
                    Session: {formatTime(sessionTime)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live Session</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isInMeeting ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Student Session</h2>
                <p className="text-gray-600 text-lg">Enter the meeting ID provided by your student to begin mentoring.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="roomId" className="block text-sm font-semibold text-gray-700 mb-3">
                    Meeting Room ID
                  </label>
                  <div className="relative">
                    <input
                      id="roomId"
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter the room ID from student"
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-6-1-6-3.5S9 9 12 9c1.5 0 3 .5 3 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleJoinMeeting}
                  disabled={!roomId.trim() || !isApiReady}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    !roomId.trim() || !isApiReady 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isApiReady ? (
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Connect as Mentor
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Loading Platform...
                    </div>
                  )}
                </button>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Pro tip:</strong> Make sure your audio and video are working before joining
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Info Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Room ID</p>
                    <p className="text-lg font-mono text-green-700">{roomId}</p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Session Time</p>
                    <p className="text-lg font-mono text-blue-700">{formatTime(sessionTime)}</p>
                  </div>
                  <div className="bg-purple-50 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Participants</p>
                    <p className="text-lg font-mono text-purple-700">{participantCount + 1}</p>
                  </div>
                </div>
                <button
                  onClick={handleLeaveMeeting}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  End Session
                </button>
              </div>
            </div>

            {/* Meeting Container */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Mentoring Session</h2>
                    <p className="text-green-100">Guiding and supporting student learning</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <div id="jitsi-container" className="w-full rounded-lg overflow-hidden shadow-inner" style={{height: '600px'}} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-medium text-gray-700">Whiteboard</span>
                  </div>
                </div>
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="font-medium text-gray-700">Resources</span>
                  </div>
                </div>
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                    </svg>
                    <span className="font-medium text-gray-700">Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}