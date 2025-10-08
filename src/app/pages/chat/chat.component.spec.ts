import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { UploadService } from '../../services/upload.service';

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let component: ChatComponent;
  let mockChat: any;
  let mockAuth: any;

  beforeEach(async () => {
    mockChat = {
      messages$: { subscribe: (fn: any) => fn([]) },
      joinChannel: jasmine.createSpy(),
      leaveChannel: jasmine.createSpy(),
      sendMessage: jasmine.createSpy(),
      sendImage: jasmine.createSpy(),
      socket: { on: () => {}, off: () => {} }
    };

    mockAuth = { username: () => 'Jack' };

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        { provide: ChatService, useValue: mockChat },
        { provide: AuthService, useValue: mockAuth },
        UploadService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    component.groupId = '1';
    component.channel = 'General';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send message', () => {
    component.newMessage = 'Hello';
    component.sendMessage();
    expect(mockChat.sendMessage).toHaveBeenCalled();
  });
});
