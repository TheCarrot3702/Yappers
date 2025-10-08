import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    service = new AuthService();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should log in a valid user', () => {
    const result = service.login('user', 'user');
    expect(result).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should reject invalid login', () => {
    const result = service.login('fake', 'wrong');
    expect(result).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should log out and clear session', () => {
    service.login('user', 'user');
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('session')).toBeNull();
  });
});
