import { io, Socket } from 'socket.io-client';
import { API_ENDPOINTS } from '@/lib';
import { TwinStateDto } from '@/types/features';

const TWIN_WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

export const digitalTwinService = {
  connectToTwin(
    projectId: string,
    onState: (state: TwinStateDto) => void,
    options?: {
      onConnect?: () => void;
      onDisconnect?: () => void;
      onError?: (error: string) => void;
    }
  ): () => void {
    const socket: Socket = io(`${TWIN_WS_URL}${API_ENDPOINTS.DIGITAL_TWIN.NAMESPACE}`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      options?.onConnect?.();
      socket.emit('subscribe', { projectId });
    });

    socket.on('disconnect', () => {
      options?.onDisconnect?.();
    });

    socket.on('connect_error', (err: { message: string; }) => {
      options?.onError?.(err.message);
    });

    socket.on('twin:error', (errMsg: string) => {
      options?.onError?.(errMsg);
    });

    socket.on('twin:state', (state: TwinStateDto) => {
      onState(state);
    });

    return () => {
      socket.emit('unsubscribe', { projectId });
      socket.disconnect();
    };
  }
};

export type DigitalTwinService = typeof digitalTwinService;
