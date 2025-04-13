export const sessionManager = {
  /**
   * Get session status
   */
  getSessionStatus() {
    const token = localStorage.getItem('accessToken');
    if (!token) return 'expired';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      
      if (expiresIn <= 0) return 'expired';
      if (expiresIn < 5 * 60 * 1000) return 'expiring';
      return 'active';
    } catch (error) {
      return 'invalid';
    }
  },

  /**
   * Start session monitoring
   */
  startSessionMonitor(onExpiring, onExpired) {
    const checkSession = () => {
      const status = this.getSessionStatus();
      
      if (status === 'expiring') {
        onExpiring?.();
      } else if (status === 'expired') {
        onExpired?.();
      }
    };

    const intervalId = setInterval(checkSession, 60 * 1000); // Check every minute
    return () => clearInterval(intervalId);
  }
}; 