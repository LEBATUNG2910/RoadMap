import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, MoreVertical, ExternalLink, AlertCircle, ArrowUp } from 'lucide-react';

// --- API Helper ---
const fetchRedditPosts = async (subreddit) => {
  // We use the raw JSON feed. 
  // Note: In a real production app, you might need a proxy to avoid CORS or Rate Limiting issues.
  const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
  
  if (!response.ok) {
    throw new Error('Subreddit not found');
  }

  const json = await response.json();
  
  // Reddit's JSON structure is deep: data -> children -> data
  return json.data.children.map((child) => ({
    id: child.data.id,
    title: child.data.title,
    author: child.data.author,
    ups: child.data.ups,
    url: child.data.url,
    permalink: `https://reddit.com${child.data.permalink}`
  }));
};

// --- Subreddit Lane Component ---
const SubredditLane = ({ subreddit, onRemove }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRedditPosts(subreddit);
      setPosts(data);
    } catch (err) {
      setError('Could not load. Does this subreddit exist?');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, [subreddit]);

  return (
    <div className="min-w-[320px] w-[320px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[80vh]">
      
      {/* Lane Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <h2 className="font-bold text-slate-800 truncate">r/{subreddit}</h2>
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-slate-200 rounded-md transition-colors"
          >
            <MoreVertical size={18} className="text-slate-500" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-8 w-32 bg-white shadow-xl border border-slate-100 rounded-lg z-10 overflow-hidden">
              <button 
                onClick={() => { loadData(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button 
                onClick={onRemove}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lane Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-slate-50/50">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <RefreshCw className="animate-spin" />
            <span className="text-sm">Fetching posts...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex flex-col items-center text-center gap-2">
            <AlertCircle size={20} />
            {error}
            <button onClick={onRemove} className="underline font-medium">Remove Lane</button>
          </div>
        )}

        {!loading && !error && posts.map((post) => (
          <article key={post.id} className="bg-white p-3 rounded-lg border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="text-xs text-slate-400 mb-1 flex justify-between">
              <span>u/{post.author}</span>
              <span className="flex items-center gap-1 text-orange-600 font-medium">
                <ArrowUp size={12} /> {post.ups > 1000 ? (post.ups/1000).toFixed(1) + 'k' : post.ups}
              </span>
            </div>
            <h3 className="font-medium text-slate-800 text-sm leading-snug mb-2">
              {post.title}
            </h3>
            <a 
              href={post.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Visit Post <ExternalLink size={10} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  // Load from LocalStorage or default to javascript/reactjs
  const [lanes, setLanes] = useState(() => {
    const saved = localStorage.getItem('reddit-lanes');
    return saved ? JSON.parse(saved) : ['javascript', 'reactjs'];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubreddit, setNewSubreddit] = useState('');

  // Persist to LocalStorage whenever lanes change
  useEffect(() => {
    localStorage.setItem('reddit-lanes', JSON.stringify(lanes));
  }, [lanes]);

  const addLane = (e) => {
    e.preventDefault();
    if (!newSubreddit.trim()) return;
    
    // Prevent duplicates
    if (lanes.includes(newSubreddit.toLowerCase())) {
      alert('This lane already exists!');
      return;
    }

    setLanes([...lanes, newSubreddit.toLowerCase()]);
    setNewSubreddit('');
    setIsModalOpen(false);
  };

  const removeLane = (targetSub) => {
    setLanes(lanes.filter(sub => sub !== targetSub));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col overflow-hidden font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-orange-500 text-white px-2 rounded-md">Reddit</span> Client
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> Add Lane
        </button>
      </header>

      {/* Horizontal Scrolling Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 w-max">
          {lanes.map((sub) => (
            <SubredditLane 
              key={sub} 
              subreddit={sub} 
              onRemove={() => removeLane(sub)} 
            />
          ))}

          {/* Empty State / Add Button at end of list */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-[100px] h-[80vh] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Plus size={32} />
            <span className="text-sm font-medium mt-2">Add Lane</span>
          </button>
        </div>
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold mb-1">Add Subreddit</h2>
            <p className="text-slate-500 text-sm mb-4">Enter the name without 'r/'</p>
            
            <form onSubmit={addLane}>
              <input
                type="text"
                placeholder="e.g., webdev"
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-orange-500 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;