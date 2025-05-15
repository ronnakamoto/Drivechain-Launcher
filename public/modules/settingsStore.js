// Use dynamic import for ES modules
let Store;

/**
 * Settings store for persisting application settings
 */
class SettingsStore {
  constructor() {
    // Create a singleton instance
    if (SettingsStore.instance) {
      return SettingsStore.instance;
    }

    // Initialize the store with schema
    this.initialized = false;
    this.initPromise = this.init();
    SettingsStore.instance = this;
  }

  async init() {
    try {
      // Dynamically import electron-store
      const storeModule = await import('electron-store');
      Store = storeModule.default;

      this.store = new Store({
        name: 'settings',
        schema: {
          theme: {
            type: 'object',
            properties: {
              isDarkMode: { type: 'boolean' },
              useSystemTheme: { type: 'boolean' }
            },
            default: {
              isDarkMode: false,
              useSystemTheme: false
            }
          },
          ui: {
            type: 'object',
            properties: {
              showQuotes: { type: 'boolean' }
            },
            default: {
              showQuotes: true
            }
          }
        }
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize settings store:', error);
      return false;
    }
  }

  /**
   * Ensure the store is initialized
   * @private
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
      if (!this.initialized) {
        throw new Error('Settings store failed to initialize');
      }
    }
  }

  /**
   * Get theme settings
   * @returns {Object} Theme settings object
   */
  async getThemeSettings() {
    await this.ensureInitialized();
    return this.store.get('theme');
  }

  /**
   * Save theme settings
   * @param {Object} settings - Theme settings object
   */
  async saveThemeSettings(settings) {
    await this.ensureInitialized();
    this.store.set('theme', settings);
  }

  /**
   * Get UI settings
   * @returns {Object} UI settings object
   */
  async getUISettings() {
    await this.ensureInitialized();
    return this.store.get('ui');
  }

  /**
   * Save UI settings
   * @param {Object} settings - UI settings object
   */
  async saveUISettings(settings) {
    await this.ensureInitialized();
    this.store.set('ui', settings);
  }

  /**
   * Get a specific setting value
   * @param {string} key - Setting key path (e.g., 'ui.showQuotes')
   * @returns {any} Setting value
   */
  async get(key) {
    await this.ensureInitialized();
    return this.store.get(key);
  }

  /**
   * Set a specific setting value
   * @param {string} key - Setting key path (e.g., 'ui.showQuotes')
   * @param {any} value - Setting value
   */
  async set(key, value) {
    await this.ensureInitialized();
    this.store.set(key, value);
  }
}

// Export a singleton instance getter
module.exports = () => new SettingsStore();
