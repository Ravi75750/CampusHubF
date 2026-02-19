import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className={`fixed top-20 z-50 animate-in duration-300 ${type === 'success' ? 'left-1/2 -translate-x-1/2 slide-in-from-top' : 'right-5 slide-in-from-right'}`}>
            {type === 'success' ? (
                /* Success Alert */
                <div role="alert" className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100 p-4 rounded-lg flex items-center shadow-lg min-w-[300px]">
                    <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-6 w-6 flex-shrink-0 mr-3 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    <div>
                        <p className="font-bold text-sm">Success</p>
                        <p className="text-xs">{message}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                /* Error Alert */
                <div role="alert" className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 p-4 rounded-lg flex items-center shadow-lg min-w-[300px]">
                    <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-6 w-6 flex-shrink-0 mr-3 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    <div>
                        <p className="font-bold text-sm">Error</p>
                        <p className="text-xs">{message}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Toast;
