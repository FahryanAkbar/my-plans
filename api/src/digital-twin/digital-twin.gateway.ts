import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DigitalTwinService } from './digital-twin.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/digital-twin',
})
export class DigitalTwinGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Namespace;

  private readonly logger = new Logger(DigitalTwinGateway.name);

  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  afterInit() {
    this.logger.log('[DigitalTwin] WebSocket Gateway initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[DigitalTwin] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    if (!projectId) {
      client.emit('twin:error', 'Invalid projectId provided');
      return;
    }

    const roomName = `project:${projectId}`;
    await client.join(roomName);
    this.logger.log(
      `[DigitalTwin] Client ${client.id} subscribed to room: ${roomName}`,
    );

    try {
      const state =
        await this.digitalTwinService.getTwinStateForProject(projectId);
      client.emit('twin:state', state);
    } catch (err) {
      this.logger.error(
        `[DigitalTwin] Error fetching initial state for client ${client.id}: ${err}`,
      );
      client.emit('twin:error', 'Failed to retrieve initial twin state');
    }
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    if (!projectId) return;

    const roomName = `project:${projectId}`;
    await client.leave(roomName);
    this.logger.log(
      `[DigitalTwin] Client ${client.id} unsubscribed from room: ${roomName}`,
    );
  }

  @Interval(15000)
  async broadcastUpdates() {
    const rooms = this.server.adapter.rooms;

    for (const [roomName, socketIds] of rooms.entries()) {
      if (roomName.startsWith('project:') && socketIds.size > 0) {
        const projectId = roomName.split(':')[1];

        try {
          const state =
            await this.digitalTwinService.getTwinStateForProject(projectId);
          this.server.to(roomName).emit('twin:state', state);
        } catch (err) {
          this.logger.error(
            `[DigitalTwin] Failed to broadcast updates for room ${roomName}: ${err}`,
          );
        }
      }
    }
  }
}
