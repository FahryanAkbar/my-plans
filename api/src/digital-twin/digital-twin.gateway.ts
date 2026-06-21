import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { Interval } from '@nestjs/schedule';
import { DigitalTwinService } from './digital-twin.service';
import { SubscribeProjectDto } from './dto/subscribe-project.dto';
import { TwinEvent } from './enums/twin-event.enum';
import {
  getRoomName,
  isProjectRoom,
  getProjectIdFromRoom,
} from './utils/room.utils';

@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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

  @SubscribeMessage(TwinEvent.SUBSCRIBE)
  async handleSubscribe(
    @MessageBody() data: SubscribeProjectDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    const roomName = getRoomName(projectId);
    await client.join(roomName);
    this.logger.log(
      `[DigitalTwin] Client ${client.id} subscribed to room: ${roomName}`,
    );

    try {
      const state =
        await this.digitalTwinService.getTwinStateForProject(projectId);
      client.emit(TwinEvent.STATE, state);
    } catch (err) {
      this.logger.error(
        `[DigitalTwin] Error fetching initial state for client ${client.id}: ${err}`,
      );
      client.emit(TwinEvent.ERROR, 'Failed to retrieve initial twin state');
    }
  }

  @SubscribeMessage(TwinEvent.UNSUBSCRIBE)
  async handleUnsubscribe(
    @MessageBody() data: SubscribeProjectDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    const roomName = getRoomName(projectId);
    await client.leave(roomName);
    this.logger.log(
      `[DigitalTwin] Client ${client.id} unsubscribed from room: ${roomName}`,
    );
  }

  @Interval(15000)
  async broadcastUpdates() {
    const rooms = this.server.adapter.rooms;
    const broadcastPromises: Promise<void>[] = [];

    for (const [roomName, socketIds] of rooms.entries()) {
      if (isProjectRoom(roomName) && socketIds.size > 0) {
        const projectId = getProjectIdFromRoom(roomName);
        broadcastPromises.push(this.broadcastToRoom(roomName, projectId));
      }
    }

    if (broadcastPromises.length > 0) {
      await Promise.allSettled(broadcastPromises);
    }
  }

  private async broadcastToRoom(
    roomName: string,
    projectId: string,
  ): Promise<void> {
    try {
      const state =
        await this.digitalTwinService.getTwinStateForProject(projectId);
      this.server.to(roomName).emit(TwinEvent.STATE, state);
    } catch (err) {
      this.logger.error(
        `[DigitalTwin] Failed to broadcast updates for room ${roomName}: ${err}`,
      );
    }
  }
}
