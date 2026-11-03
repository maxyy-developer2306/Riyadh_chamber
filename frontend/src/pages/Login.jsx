import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid Username or Password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" onError={(e)=>{e.target.style.display='none'}} />
          <h2 className="text-xl font-bold text-white">Admin Login</h2>
          <p className="text-xs text-neutral-400 mt-1">Riyadh Chamber Document Management</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-sm rounded-lg text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#121212] border border-[#27272a] rounded-lg px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-white transition"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#27272a] rounded-lg px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-white transition"
                required 
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-white text-black font-medium py-2 rounded-lg text-sm hover:bg-neutral-200 transition mt-2">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}