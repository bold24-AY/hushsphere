/**
 * InfoSidebar Component
 * Handles the right-side panel with user info and the critical "Burn Account" feature.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const InfoSidebar = () => {
    const navigate = useNavigate();

    const handleBurn = async () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete your account and ALL message history for everyone you've talked to. This action cannot be undone.")) {
            try {
                const response = await fetch("http://localhost:5000/auth/delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token") // Adjust if you use tokens
                    },
                    credentials: "include" // Important for session cookies
                });
                const data = await response.json();
                if (data.status) {
                    // Trigger animation
                    document.body.classList.add('burning-effect');

                    // Create particles (simplified version of the prototype script)
                    for (let i = 0; i < 100; i++) {
                        const ember = document.createElement('div');
                        ember.className = 'ember-particle';
                        ember.style.left = Math.random() * window.innerWidth + 'px';
                        ember.style.top = Math.random() * window.innerHeight + 'px';
                        ember.style.setProperty('--tw-tx', (Math.random() - 0.5) * 400 + 'px');
                        ember.style.setProperty('--tw-ty', -Math.random() * 600 - 100 + 'px');
                        document.body.appendChild(ember);
                    }

                    setTimeout(() => {
                        alert("Session Terminated. Data Purged.");
                        navigate("/");
                        window.location.reload();
                    }, 2000);
                } else {
                    alert("Failed to burn account: " + data.message);
                }
            } catch (err) {
                console.error(err);
                alert("Error burning account");
            }
        }
    };

    return (
        <aside className="w-80 glass border-l border-white/5 hidden xl:flex flex-col z-20 px-6 py-6 overflow-y-auto">
            <div className="text-center mb-8 relative">
                <div className="size-24 rounded-full p-1 bg-gradient-to-br from-white/10 to-transparent mx-auto mb-4 border border-white/10 relative group cursor-pointer">
                    <div className="w-full h-full rounded-full bg-surface grid place-items-center relative overflow-hidden">
                        <span className="text-3xl font-bold text-slate-500">ME</span>
                        <img src={`https://ui-avatars.com/api/?name=Me&background=161b22&color=64748b`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
                    </div>
                    <span className="absolute bottom-1 right-1 size-5 bg-green-500 border-4 border-dark rounded-full z-20 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">My Account</h2>
            </div>

            <div className="space-y-6">
                {/* Options */}
                <div className="space-y-1">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors text-xs font-medium group">
                        <span>Notification Settings</span>
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">notifications</span>
                    </button>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button onClick={handleBurn} className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all group overflow-hidden relative shadow-lg hover:shadow-red-500/20 active:scale-95">
                    <span className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg group-hover:animate-bounce">local_fire_department</span>
                        Burn Account
                    </span>
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-3 leading-relaxed opacity-60">
                    Permanently deletes account and ALL messages.
                </p>
            </div>
        </aside>
    );
};

export default InfoSidebar;
