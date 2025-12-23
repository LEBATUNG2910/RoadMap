import { useState, useEffect,} from 'react';
import { Search, Wind, Droplets, RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const API_KEY = '43DXR9R388T8E2JXVD7W4NRTR'; // Replace with your key
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const App = () => {
  const [location, setLocation] = useState('New York'); // Default location
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (searchLocation) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Calculate Date Range (Yesterday to Tomorrow to ensure full 48h coverage)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Format dates as YYYY-MM-DD for API
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      const endpoint = `${BASE_URL}/${searchLocation}/${formatDate(yesterday)}/${formatDate(tomorrow)}?unitGroup=metric&key=${API_KEY}&include=hours,current`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Location not found or API limit reached');
      
      const data = await response.json();
      
      // 2. Process Hourly Data (Flatten & Filter)
      const currentEpoch = Math.floor(Date.now() / 1000);
      const twentyFourHours = 24 * 60 * 60;
      
      // Combine hours from all returned days into one flat array
      const allHours = data.days.flatMap(day => 
        day.hours.map(hour => ({
          ...hour,
          dayDate: day.datetime // Keep track of which day this hour belongs to
        }))
      );

      // Filter: Keep hours between (Now - 24h) and (Now + 24h)
      const filteredHours = allHours.filter(hour => 
        hour.datetimeEpoch >= currentEpoch - twentyFourHours &&
        hour.datetimeEpoch <= currentEpoch + twentyFourHours
      );

      setWeatherData({
        current: data.currentConditions,
        timezone: data.timezone,
        address: data.resolvedAddress,
        description: data.description,
        hours: filteredHours
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchWeather(location);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(location);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center font-sans">
      
      {/* --- Search Section --- */}
      <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button 
          type="button" 
          onClick={() => fetchWeather(location)}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </form>

      {/* --- Error State --- */}
      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* --- Main Content --- */}
      <AnimatePresence mode='wait'>
        {weatherData && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl space-y-6"
          >
            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{weatherData.address}</h1>
                  <p className="text-blue-200 mt-1">{weatherData.description}</p>
                </div>
                <div className="text-right">
                   {/* Displaying Current Condition Text */}
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {weatherData.current.conditions}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="text-7xl font-bold tracking-tighter">
                  {Math.round(weatherData.current.temp)}°
                </div>
                
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <Wind className="w-6 h-6 mb-1 text-blue-200" />
                    <span className="text-sm text-blue-100">{weatherData.current.windspeed} km/h</span>
                    <span className="text-xs text-blue-300">Wind</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Droplets className="w-6 h-6 mb-1 text-blue-200" />
                    <span className="text-sm text-blue-100">{weatherData.current.precipprob}%</span>
                    <span className="text-xs text-blue-300">Rain</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700">
              <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 48-Hour Timeline (Past & Future)
              </h3>
              
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                <div className="flex gap-4 w-max">
                  {weatherData.hours.map((hour, idx) => {
                    const isNow = idx === 24; // Roughly the middle point
                    return (
                      <div 
                        key={hour.datetimeEpoch}
                        className={`flex flex-col items-center p-4 rounded-2xl min-w-[80px] ${
                          isNow ? 'bg-blue-600 shadow-lg scale-105' : 'bg-slate-700/50'
                        }`}
                      >
                        <span className="text-xs text-slate-400 mb-1">
                          {hour.datetime.slice(0, 5)}
                        </span>
                        <span className="text-xl font-bold mb-1">
                          {Math.round(hour.temp)}°
                        </span>
                         {/* Simple condition logic for icon placeholder */}
                        <span className="text-[10px] text-slate-300 text-center truncate w-full">
                           {hour.conditions.split(',')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;