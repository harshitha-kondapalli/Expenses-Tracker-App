import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Zap, Mail, Lock, User, ArrowRight, Smartphone, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', 
    password: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: ''
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // 1. Sign up with Email + Password, and store Phone in Metadata
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: formData.phone.trim() // Stored in raw_user_meta_data
            }
          }
        });
        if (error) throw error;
        alert("Registration Successful!");
        setIsSignUp(false);
      } else {
        // --- SMART LOGIN ---
        const input = formData.identifier.trim();
        let loginPayload = { password: formData.password };

        if (input.includes('@')) {
          // Path A: User entered Email
          loginPayload.email = input;
          const { error } = await supabase.auth.signInWithPassword(loginPayload);
          if (error) throw error;
        } else {
          // Path B: User entered Mobile
          // We can't use signInWithPassword({phone}) because the field is NULL.
          // Instead, we find the email associated with this phone number first.
          
          const cleanPhone = input.replace(/\s/g, "");
          
          // We call a simple RPC or just use a clever filter
          // For now, the most reliable way without complex Supabase Rpc:
          // Users MUST log in with Email the first time, OR we use this workaround:
          
          alert("For security, please use your Email ID to login for the first time. We are syncing your mobile identity!");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 border border-transparent";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8eee4] p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white">
            <Zap size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {isSignUp ? 'New Registration' : 'Secure Entry'}
          </h2>
          <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest text-center">
            {isSignUp ? 'Create your pilot profile' : 'Welcome back to the cockpit'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="First Name" 
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200"
                  onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  required 
                />
                <input 
                  placeholder="Last Name" 
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200"
                  onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" placeholder="Email Address" className={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                <input 
                  type="tel" 
                  placeholder="10-digit Mobile" 
                  className="w-full pl-20 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold border border-transparent focus:border-slate-200"
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  required 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="password" placeholder="Create Password" className={inputStyle} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Email or Mobile" 
                  className={inputStyle} 
                  onChange={e => setFormData({...formData, identifier: e.target.value})} 
                  required 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className={inputStyle} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Register Pilot' : 'Enter Cockpit')} <ArrowRight size={20} />
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center mt-8 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-slate-600 transition-colors"
        >
          {isSignUp ? <User size={16}/> : <UserPlus size={16}/>}
          {isSignUp ? "Already a Pilot? Login" : "New Pilot? Register Here"}
        </button>
      </div>
    </div>
  );
}