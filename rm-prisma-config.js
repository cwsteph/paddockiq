const fs = require("fs");
// Remove prisma.config.ts - only needed for Prisma 7
try { fs.unlinkSync("prisma.config.ts"); console.log("Removed prisma.config.ts"); } catch(e) { console.log("Already gone"); }
