import { useEffect, useRef, useState } from 'react';

interface UseSocketOptions {
    url: string;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
}

export function useSocket(options: UseSocketOptions) {
    const { url, onOpen, onClose, onError, onMessage } = options;
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = (event) => {
            setIsConnected(true);
            onOpen?.(event);
        };

        socketRef.current.onclose = (event) => {
            setIsConnected(false);
            onClose?.(event);
        };

        socketRef.current.onerror = (event) => {
            onError?.(event);
        };

        socketRef.current.onmessage = (event) => {
            onMessage?.(event);
        };

        return () => {
            socketRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const sendMessage = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        if (socketRef.current && isConnected) {
            socketRef.current.send(data);
        }
    };

    return {
        isConnected,
        sendMessage,
        socket: socketRef.current,
    };
}