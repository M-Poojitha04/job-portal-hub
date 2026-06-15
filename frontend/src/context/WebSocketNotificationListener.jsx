import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function WebSocketNotificationListener() {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Create an open socket handshake link matching our server config path
        const socket = new SockJS('http://localhost:8080/ws-portal');
        const stompClient = Stomp.over(socket);

        // Silence internal tracking debugger heartbeat console lines
        stompClient.debug = null;

        stompClient.connect({}, () => {
            // Subscribe to the system announcements broker channel
            stompClient.subscribe('/topic/system-announcements', (message) => {
                const eventData = JSON.parse(message.body);
                setToast(eventData);

                // Automatically clear the notification card after 5 seconds
                setTimeout(() => setToast(null), 5000);
            });
        }, (err) => console.log("WebSocket disconnect layer deferred. reconnecting..."));

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl max-w-sm w-full animate-slideIn flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-xs font-black text-amber-400 tracking-wider uppercase">📢 System Announcement</span>
                <button onClick={() => setToast(null)} className="text-xs text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-1">{toast.title}</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{toast.summary}</p>
        </div>
    );
}