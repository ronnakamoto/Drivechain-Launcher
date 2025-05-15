const axios = require('axios');

class BitWindowClient {
  constructor() {
    this.config = {
      baseURL: 'http://127.0.0.1:8080',
      headers: {
        'Content-Type': 'application/json',
        'Connect-Protocol-Version': '1'
      }
    };
    this.connected = false;
    this.initializingBinary = false;
  }

  async makeConnectRequest(service, method, body = {}) {
    try {
      const response = await axios.post(
        `${this.config.baseURL}/${service}/${method}`,
        body,
        this.config
      );
      return response.data;
    } catch (error) {
      console.error(`BitWindow Connect call failed (${service}/${method}):`, error.message);
      throw error;
    }
  }

  async checkConnection() {
    try {
      // Use BitcoindService for status check
      await this.makeConnectRequest('bitcoind.v1.BitcoindService', 'GetBlockchainInfo', {});
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForConnection(timeoutSeconds = 60) {
    this.initializingBinary = true;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutSeconds * 1000) {
      try {
        if (await this.checkConnection()) {
          this.connected = true;
          this.initializingBinary = false;
          return true;
        }
      } catch (error) {
        // Ignore errors and keep trying
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.initializingBinary = false;
    throw new Error('BitWindow connection timeout');
  }

  async stop() {
    try {
      // Note: This method is kept for API compatibility, but we no longer use it for stopping BitWindow
      // on macOS since the API approach is unreliable. We now use direct process termination instead.
      console.log('BitWindow API stop method called, but not used for termination on macOS');

      // For non-macOS platforms, we'll still try to use the API
      if (process.platform !== 'darwin') {
        await this.makeConnectRequest('bitwindowd.v1.BitwindowdService', 'Stop', {});
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.connected = false;
      return true;
    } catch (error) {
      console.error('Failed to stop BitWindow via API:', error);
      throw error;
    }
  }
}

module.exports = BitWindowClient;
