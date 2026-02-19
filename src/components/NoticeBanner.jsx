import { useEffect, useState } from 'react';
import { api } from '../api';

export default function NoticeBanner() {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        // Fetch notices freely or if user is logged in? Notices usually public.
        // Assuming public endpoint or we catch error if auth required (but users are mostly logged in)
        // If notices endpoint requires auth, this might fail on login page. 
        // Let's assume public or fails gracefully.
        api.get('/admin/notices').then(res => setNotices(res.data)).catch(() => { });
    }, []);

    if (notices.length === 0) return null;

    return (
        <div className="flex flex-col w-full">
            {notices.map(notice => (
                <div key={notice._id} className={`w-full p-2 text-center text-sm font-medium ${notice.important ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    <span className="font-bold mr-2">[{notice.important ? 'IMPORTANT' : 'NOTICE'}]</span>
                    {notice.title}: {notice.content}
                </div>
            ))}
        </div>
    );
}
