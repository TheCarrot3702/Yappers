// ============================================================
// 🧪 Jest Configuration
// ------------------------------------------------------------
// Sets up the testing environment for Node.js and handles
// ES module path resolution for imports without extensions.
// ============================================================

export default {
  // Use Node environment for backend testing
  testEnvironment: "node",

  // Disable Babel or TS transforms (we're using native ESM)
  transform: {},

  // Allow Jest to import .js files without specifying extensions
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
