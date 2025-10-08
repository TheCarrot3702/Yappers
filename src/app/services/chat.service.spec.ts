import { ChatService } from './chat.service';
import { AuthService } from './auth.service';

// ✅ Mock the io function
const io = jasmine.createSpy('io');

describe('ChatService', () => {
  let service: ChatService;
  let mockSocket: any;
  let mockAuth: Partial<AuthService>;

  beforeEach(() => {
    mockSocket = {
      on: jasmine.createSpy('on'),
      emit: jasmine.createSpy('emit'),
      off: jasmine.createSpy('off')
    };

    // Make io() return our mock socket
    io.and.returnValue(mockSocket);

    // Provide mock AuthService
    mockAuth = { session: { username: 'Jack', role: 'user' } };

    // Inject io globally before ChatService initializes
    (window as any).io = io;

    service = new ChatService(mockAuth as AuthService);
  });

  it('should create socket connection', () => {
    expect(service).toBeTruthy();
    expect(io).toHaveBeenCalled();
  });

  it('should send a message', () => {
    service.sendMessage('1', 'General', 'Jack', 'Hello');
    expect(mockSocket.emit).toHaveBeenCalledWith('sendMessage', jasmine.any(Object));
  });

  it('should send an image', () => {
    service.sendImage('1', 'General', 'Jack', 'img.jpg');
    expect(mockSocket.emit).toHaveBeenCalledWith('sendImage', jasmine.any(Object));
  });
});
