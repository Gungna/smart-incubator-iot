import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Thermometer, Droplets, Activity, RotateCw, Power, Server, Clock, 
  Bird, LogOut, User, Lock, Settings, AlertTriangle, FileText, Ban, Wind, Zap
} from 'lucide-react';

// === KONFIGURASI URL ===
const API_URL = "https://8000-firebase-smart-incubator-iot-1764862507841.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev";

// === DATABASE PRESET LOKAL (Agar tidak perlu request server terus menerus) ===
const PRESETS = {
  AYAM: {
    target_temp_low: 37.5,
    target_temp_high: 38.0,
    target_hum_low: 50.0,
    servo_interval: 7200 // 2 Jam
  },
  BEBEK: {
    target_temp_low: 37.0,
    target_temp_high: 37.5,
    target_hum_low: 60.0,
    servo_interval: 10800 // 3 Jam
  }
};

// === KOMPONEN UI ===
const Card = ({ children, className = "", onClick, color = "white" }) => {
  const borderColors = {
    white: "border-slate-700/50 hover:border-slate-500/50",
    blue: "border-blue-500/30 hover:border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    red: "border-red-500/30 hover:border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
    green: "border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    purple: "border-purple-500/30 hover:border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
  };

  return (
    <div onClick={onClick} className={`backdrop-blur-xl bg-slate-900/60 border rounded-2xl p-6 transition-all duration-300 ${borderColors[color]} ${className}`}>
      {children}
    </div>
  );
};

// === AUTH CONTEXT ===
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const login = (t) => { localStorage.setItem('token', t); setToken(t); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };
  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
};

// === LOGIN PAGE ===
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isLogin ? "Sedang Login..." : "Mendaftarkan...");
    try {
      if (isLogin) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axios.post(`${API_URL}/token`, formData);
        login(res.data.access_token);
        toast.success("Login Berhasil!", { id: loadingToast });
        navigate('/');
      } else {
        await axios.post(`${API_URL}/register`, { username, password });
        toast.success("Registrasi Sukses!", { id: loadingToast });
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal Masuk/Daftar", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black p-4">
      <Card className="w-full max-w-md" color="blue">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {isLogin ? "System Access" : "New Account"}
          </h2>
          <p className="text-slate-400 text-sm mt-2">Smart Hatchery IoT Control</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
            <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-all" required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-all" required />
          </div>
          <button type="submit" className="w-full py-3.5 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">
            {isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-500 text-sm cursor-pointer hover:text-white" onClick={()=>setIsLogin(!isLogin)}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
        </p>
      </Card>
    </div>
  );
};

// === DASHBOARD UTAMA ===
const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);

  // Helper konversi
  const secondsToTime = (total) => {
    if (!total || isNaN(total)) return { h: 0, m: 0, s: 0 };
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return { h, m, s };
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "00:00:00";
    try { return new Date(s * 1000).toISOString().substr(11, 8); } catch { return "00:00:00"; }
  };

  // GLOBAL STATE
  const [data, setData] = useState({ temperature: 0, humidity: 0, status: 'WAITING', is_maintenance: false });
  const [history, setHistory] = useState([]);
  const [activeSettings, setActiveSettings] = useState(null); // Settingan yang SEDANG AKTIF di server
  const [timeLeft, setTimeLeft] = useState(7200); 
  const [servoInterval, setServoInterval] = useState(7200);

  // LOCAL FORM STATE (Untuk di dalam Modal, agar tidak ganggu dashboard)
  const [showSettings, setShowSettings] = useState(false);
  const [formSettings, setFormSettings] = useState(null); // Settingan semetara di form
  const [inputTime, setInputTime] = useState({ h: 2, m: 0, s: 0 });

  const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

  // === INIT DATA ===
  useEffect(() => {
    const init = async () => {
        try {
            const res = await authAxios.get('/settings');
            const serverData = res.data;
            setActiveSettings(serverData);
            
            if(serverData.servo_interval) {
                setServoInterval(serverData.servo_interval);
            }
        } catch(e) { console.error(e); }
    };
    init();
  }, []);

  // === POLLING SENSOR ===
  useEffect(() => {
    const loop = setInterval(async () => {
      try {
        const [latest, hist] = await Promise.all([
          authAxios.get('/latest'),
          authAxios.get('/history')
        ]);
        setData(latest.data);
        setHistory(hist.data.map(d => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } catch (err) { if(err.response?.status===401) logout(); }
    }, 2000);
    return () => clearInterval(loop);
  }, []);

  // === COUNTDOWN TIMER ===
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : servoInterval), 1000);
    return () => clearInterval(timer);
  }, [servoInterval]);

  // === ACTIONS ===
  const openSettings = () => {
    // Saat modal dibuka, salin settingan aktif ke form lokal
    if (activeSettings) {
        setFormSettings({...activeSettings});
        setInputTime(secondsToTime(activeSettings.servo_interval));
        setShowSettings(true);
    }
  };

  const applyPresetLocal = (name) => {
    // Logika Preset LOKAL (Tidak request server, jadi instan & tidak error)
    if (!PRESETS[name]) return;
    const p = PRESETS[name];
    
    // Update Form State saja (Preview)
    setFormSettings(prev => ({
        ...prev,
        preset_name: name,
        target_temp_low: p.target_temp_low,
        target_temp_high: p.target_temp_high,
        target_hum_low: p.target_hum_low,
        servo_interval: p.servo_interval
    }));
    
    // Update Input Time UI
    setInputTime(secondsToTime(p.servo_interval));
    toast.success(`Preset ${name} diterapkan (Klik Simpan untuk konfirmasi)`);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    const load = toast.loading("Menyimpan...");
    
    // Hitung total detik dari input HH:MM:SS
    const totalSeconds = (parseInt(inputTime.h||0) * 3600) + (parseInt(inputTime.m||0) * 60) + parseInt(inputTime.s||0);
    
    // Siapkan Payload Bersih
    const payload = {
        preset_name: String(formSettings.preset_name),
        target_temp_low: parseFloat(formSettings.target_temp_low),
        target_temp_high: parseFloat(formSettings.target_temp_high),
        target_hum_low: parseFloat(formSettings.target_hum_low),
        temp_offset: parseFloat(formSettings.temp_offset),
        hum_offset: parseFloat(formSettings.hum_offset),
        servo_interval: parseInt(totalSeconds),
        is_maintenance: Boolean(formSettings.is_maintenance)
    };

    try {
      await authAxios.post('/settings', payload);
      
      // Sukses: Update State Global Dashboard
      setActiveSettings(payload);
      setServoInterval(payload.servo_interval);
      setTimeLeft(payload.servo_interval);
      setData(prev => ({...prev, is_maintenance: payload.is_maintenance}));
      
      toast.success("Berhasil Disimpan!", { id: load });
      setShowSettings(false);
    } catch (err) { 
        console.error(err);
        toast.error("Gagal Menyimpan", { id: load }); 
    }
  };

  const downloadCSV = () => {
    if (!history.length) return toast.error("Data kosong!");
    const content = "data:text/csv;charset=utf-8,Time,Temp,Hum,Status\n" + history.map(r => `${r.timestamp},${r.temperature},${r.humidity},${r.status}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(content);
    link.download = "laporan.csv";
    link.click();
  };

  const sendCommand = async (action) => {
    if (data.is_maintenance) return toast.error("Maintenance Mode Aktif!");
    try {
      await authAxios.post(`/control/${action}`);
      if(action === 'SERVO_TURN') setTimeLeft(servoInterval);
      toast.success(`Perintah ${action} dikirim`);
    } catch { toast.error("Gagal kirim perintah"); }
  };

  // Visual Helpers
  const isDanger = data.status === 'DANGER';
  const isOptimal = data.status === 'OPTIMAL';
  const statusColor = isDanger ? 'text-red-500' : isOptimal ? 'text-emerald-400' : 'text-amber-400';
  const borderColor = isDanger ? 'border-red-500/50' : isOptimal ? 'border-emerald-500/50' : 'border-amber-500/50';

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10"></div>
      
      {/* === OVERLAY MAINTENANCE === */}
      {data.is_maintenance && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="p-8 border-2 border-red-600 rounded-3xl bg-red-900/20 text-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <AlertTriangle size={80} className="text-red-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-black text-red-500 tracking-widest mb-2">MAINTENANCE</h1>
            <p className="text-red-200 mb-6">Sistem dimatikan untuk perawatan.</p>
            <button onClick={async () => {
               // Quick maintenance off
               const newState = {...activeSettings, is_maintenance: false};
               try {
                   await authAxios.post('/settings', newState);
                   setActiveSettings(newState);
                   setData({...data, is_maintenance: false});
                   toast.success("System Online");
               } catch { toast.error("Gagal update"); }
            }} className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold flex items-center gap-2 mx-auto">
              <Power size={20}/> MATIKAN MODE INI
            </button>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <div className={`max-w-7xl mx-auto p-4 md:p-8 space-y-6 transition-all duration-500 ${data.is_maintenance ? 'blur-md pointer-events-none' : ''}`}>
        
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Smart Hatchery</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${data.status === 'WAITING' ? 'bg-slate-500' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="text-xs text-slate-400">System Active</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={openSettings} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 text-slate-300 transition-all"><Settings size={20} /></button>
            <button onClick={logout} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 text-red-500 transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`flex items-center justify-between ${borderColor} ${isDanger ? 'bg-red-900/10' : 'bg-slate-800/20'}`} color={isDanger ? "red" : "blue"}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isDanger ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                        <Activity className={statusColor} />
                    </div>
                    <div>
                        <p className="text-xs font-bold opacity-60 tracking-widest uppercase">AI Diagnosis</p>
                        <h2 className={`text-2xl font-bold ${statusColor}`}>{data.status}</h2>
                    </div>
                </div>
                {data.temperature > 38.5 && (
                    <div className="flex flex-col items-center text-blue-400 animate-pulse">
                        <Wind className="animate-spin w-8 h-8 mb-1"/>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Cooling</span>
                    </div>
                )}
            </Card>

            <Card className="flex items-center justify-between" color="green">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-500/20">
                        <Bird className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold opacity-60 tracking-widest uppercase">Hatch Probability</p>
                        <h2 className="text-2xl font-bold text-emerald-400">
                            {data.status === 'OPTIMAL' ? '95% (High)' : data.status === 'WARNING' ? '70% (Medium)' : '40% (Low)'}
                        </h2>
                    </div>
                </div>
                <div className="hidden md:flex w-16 h-16 rounded-full border-4 border-emerald-500/30 items-center justify-center">
                    <span className="text-xl font-bold text-emerald-500">AI</span>
                </div>
            </Card>
        </div>

        {/* MAIN DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden flex flex-col items-center justify-center py-10" color="red">
                <Thermometer size={140} className="absolute -right-6 -bottom-6 text-red-500/10 -rotate-12"/>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border border-slate-700 px-3 py-1 rounded-full bg-black/20">Suhu Ruang</span>
                <div className="flex items-start z-10">
                    <span className="text-7xl font-bold text-white tracking-tighter">{data.temperature.toFixed(1)}</span>
                    <span className="text-2xl font-medium text-slate-500 mt-2 ml-1">°C</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 mt-6 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.6)]" style={{ width: `${(data.temperature / 45) * 100}%` }}></div>
                </div>
            </Card>

            <Card className="relative overflow-hidden flex flex-col items-center justify-center py-10" color="blue">
                <Droplets size={140} className="absolute -right-6 -bottom-6 text-blue-500/10 -rotate-12"/>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border border-slate-700 px-3 py-1 rounded-full bg-black/20">Kelembapan</span>
                <div className="flex items-start z-10">
                    <span className="text-7xl font-bold text-blue-400 tracking-tighter">{data.humidity.toFixed(1)}</span>
                    <span className="text-2xl font-medium text-slate-500 mt-2 ml-1">%</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 mt-6 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${data.humidity}%` }}></div>
                </div>
            </Card>

            <Card className="flex flex-col justify-between" color="purple">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 opacity-70">
                        <Clock size={14} className="text-purple-400 animate-pulse"/>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Auto Turn In</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 shadow-inner">
                        <span className="text-4xl font-mono font-bold text-white tracking-widest">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={()=>sendCommand('SERVO_TURN')} className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group">
                        <RotateCw size={20} className="text-blue-400 mb-1 group-hover:rotate-180 transition-transform duration-500"/>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-200">MANUAL TURN</span>
                    </button>
                    <button onClick={()=>sendCommand('TEST_ALL')} className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-yellow-900/30 border border-slate-700 hover:border-yellow-500/50 rounded-xl transition-all group">
                        <Zap size={20} className="text-yellow-400 mb-1 group-hover:scale-110 transition-transform"/>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-yellow-200">TEST AKTUATOR</span>
                    </button>
                </div>
            </Card>
        </div>

        <Card className="h-80 relative" color="green">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-300"><Activity size={18} className="text-emerald-500"/> Live Monitoring</h3>
                <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold border border-slate-600 transition-colors">
                    <FileText size={14}/> Download Data
                </button>
             </div>
             <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={history}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" tick={false} axisLine={false}/>
                    <YAxis domain={['auto', 'auto']} stroke="#475569" axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', color:'#fff'}} />
                    <Area type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} fill="url(#colorTemp)" />
                </AreaChart>
             </ResponsiveContainer>
        </Card>
      </div>

      {/* === MODAL SETTINGS === */}
      {showSettings && formSettings && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900/90 border border-slate-700/50 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Settings className="text-blue-500"/> System Configuration
                    </h2>
                    <button onClick={()=>setShowSettings(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">✕</button>
                </div>
                
                <form onSubmit={saveSettings} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">Select Preset Profile</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={()=>applyPresetLocal('AYAM')} 
                                className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${formSettings.preset_name==='AYAM' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                <Bird size={20}/> <span className="font-bold">AYAM</span>
                            </button>
                            <button type="button" onClick={()=>applyPresetLocal('BEBEK')} 
                                className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${formSettings.preset_name==='BEBEK' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                <Bird size={20}/> <span className="font-bold">BEBEK</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-4 block flex items-center gap-2">
                            <Settings size={12}/> Sensor Calibration
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] text-slate-500 mb-1 block">Temp Offset (°C)</span>
                                <input type="number" step="0.1" value={formSettings.temp_offset} onChange={e=>setFormSettings({...formSettings, temp_offset: e.target.value})}
                                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-white font-mono focus:border-blue-500 focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 mb-1 block">Hum Offset (%)</span>
                                <input type="number" step="0.1" value={formSettings.hum_offset} onChange={e=>setFormSettings({...formSettings, hum_offset: e.target.value})}
                                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-white font-mono focus:border-blue-500 focus:outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">Auto-Turn Interval</label>
                         <div className="grid grid-cols-3 gap-2">
                            {['Jam', 'Menit', 'Detik'].map((label, i) => (
                                <div key={label} className="relative">
                                    <input type="number" min="0" max={i===0?99:59} 
                                        value={i===0 ? inputTime.h : i===1 ? inputTime.m : inputTime.s} 
                                        onChange={e => setInputTime({...inputTime, [i===0?'h':i===1?'m':'s']: e.target.value})}
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-center font-mono text-lg font-bold text-white focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                    <span className="absolute bottom-1.5 left-0 right-0 text-[9px] text-center text-slate-500 uppercase font-bold">{label}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <label className="flex items-center justify-between cursor-pointer group p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                            <div>
                                <span className="font-bold text-red-500 flex items-center gap-2"><Ban size={18}/> Emergency Mode</span>
                                <p className="text-[10px] text-slate-500 mt-0.5">Disable all actuators for cleaning.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={formSettings.is_maintenance} onChange={e=>setFormSettings({...formSettings, is_maintenance: e.target.checked})} className="sr-only peer"/>
                                <div className="w-12 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 transition-colors"></div>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={()=>setShowSettings(false)} className="flex-1 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// === ROUTING UTAMA ===
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{style:{background:'#0f172a', color:'#fff', border:'1px solid #334155'}}}/>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const RequireAuth = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/auth" replace />;
};

export default App;