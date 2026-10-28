// =======================================================
// VeriText Backend Entry Point (Compatibility Wrapper)
// =======================================================
// Forwards execution to src/server.js to ensure full compatibility
// with Render start command (node server.js) and standard MVC (src/server.js).

require("./src/server");
