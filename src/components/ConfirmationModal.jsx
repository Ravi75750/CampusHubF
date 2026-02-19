import React, { useRef, useEffect } from 'react';

const ConfirmationModal = ({ isOpen, title, onConfirm, onCancel, confirmText = "Yes", cancelText = "No", confirmColor = "red" }) => {
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onCancel();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800"
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-6">
                    {title}
                </h3>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-colors shadow-lg ${confirmColor === 'red'
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
