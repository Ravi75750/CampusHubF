

import React, { useState } from 'react';
import LoginPage from './LoginPage';

const LandingPage = () => {
    const [showLogin, setShowLogin] = useState(false);

    const handleExplore = () => {
        setShowLogin(true);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">

            {/* Background Image (covers navbar too) */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/Homebg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: showLogin
                        ? 'blur(8px) brightness(0.6)'
                        : 'blur(2px) brightness(0.9)',
                    transition: 'all 0.5s ease-in-out',
                    transform: 'scale(1.03)',
                }}
            />

            {/* Navbar is handled by App.jsx */}

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-24">

                {!showLogin && (
                    <div className="text-center animate-fade-in mt-20">
                        {/* Explore Button moved downward */}
                        <p className="text-[60px] font-bold text-[#0096e1] mb-4
  [text-shadow:1px_1px_0_#fff,-1px_1px_0_#fff,1px_-1px_0_#fff,-1px_-1px_0_#fff]">
                            “A place for voices, ideas, and opportunities.”
                        </p>
                        <div
                            onClick={handleExplore}
                            className="cursor-pointer"
                        >
                            <button className="px-10 py-3 bg-[#0096e1] text-white font-bold rounded-full text-xl shadow-lg hover:bg-[#007fb1] transition-all transform hover:scale-105">
                                Explore Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Login Modal */}
                {showLogin && (
                    <div className="animate-fade-in-up w-full max-w-md p-4">
                        <div className="bg-slate-900/90 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative">
                            <button
                                onClick={() => setShowLogin(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                            <LoginPage isModal={true} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
