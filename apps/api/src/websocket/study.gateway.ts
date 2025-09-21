import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

// DTO for progress update
export class ProgressUpdateDto {
  sessionId: string;
  userId: string;
  progress: Record<string, any>;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class StudyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StudyGateway.name);
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`WebSocket client connected: ${client.id}`);
    // Optionally authenticate client here
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinStudySession')
  handleJoinStudySession(
    @MessageBody() data: { sessionId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.sessionId);
    this.server.to(data.sessionId).emit('userJoined', { userId: data.userId });
  }

  @SubscribeMessage('leaveStudySession')
  handleLeaveStudySession(
    @MessageBody() data: { sessionId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.leave(data.sessionId);
    this.server.to(data.sessionId).emit('userLeft', { userId: data.userId });
  }

  @SubscribeMessage('progressUpdate')
  handleProgressUpdate(@MessageBody() data: ProgressUpdateDto) {
    this.server.to(data.sessionId).emit('progressUpdate', data);
  }
}
