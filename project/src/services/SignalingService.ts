export interface User {
  id: string;
  name: string;
}

export interface SignalingMessage {
  type: string;
  data: any;
  roomId?: string;
  userId?: string;
}

export class SignalingService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event handlers
  public onUserJoined: ((user: User) => void) | null = null;
  public onUserLeft: ((userId: string) => void) | null = null;
  public onMessage: ((data: any) => void) | null = null;
  public onReaction: ((data: any) => void) | null = null;
  public onSignalingMessage: ((message: SignalingMessage) => void) | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use a mock WebSocket for demo purposes
        this.ws = new MockWebSocket() as any;
        
        this.ws.onopen = () => {
          console.log('Connected to signaling server');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from signaling server');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: SignalingMessage) {
    switch (message.type) {
      case 'user-joined':
        if (this.onUserJoined) {
          this.onUserJoined(message.data);
        }
        break;
      
      case 'user-left':
        if (this.onUserLeft) {
          this.onUserLeft(message.data.userId);
        }
        break;
      
      case 'chat-message':
        if (this.onMessage) {
          this.onMessage(message.data);
        }
        break;
      
      case 'reaction':
        if (this.onReaction) {
          this.onReaction(message.data);
        }
        break;
      
      default:
        if (this.onSignalingMessage) {
          this.onSignalingMessage(message);
        }
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect().catch(console.error);
      }, delay);
    }
  }

  async joinRoom(roomId: string, user: User): Promise<void> {
    if (!this.ws) throw new Error('Not connected to signaling server');
    
    this.send({
      type: 'join-room',
      roomId,
      data: user
    });
  }

  leaveRoom(roomId: string): void {
    if (!this.ws) return;
    
    this.send({
      type: 'leave-room',
      roomId
    });
  }

  sendMessage(roomId: string, data: any): void {
    if (!this.ws) return;
    
    this.send({
      type: 'chat-message',
      roomId,
      data
    });
  }

  sendReaction(roomId: string, data: any): void {
    if (!this.ws) return;
    
    this.send({
      type: 'reaction',
      roomId,
      data
    });
  }

  sendSignalingData(roomId: string, targetUserId: string, data: any): void {
    if (!this.ws) return;
    
    this.send({
      type: 'signaling',
      roomId,
      userId: targetUserId,
      data
    });
  }

  private send(message: SignalingMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Mock WebSocket for demo purposes
class MockWebSocket {
  public readyState = WebSocket.OPEN;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor() {
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string): void {
    // Mock echo for demo
    const message = JSON.parse(data);
    
    if (message.type === 'chat-message') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', { data }));
        }
      }, 100);
    }
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}