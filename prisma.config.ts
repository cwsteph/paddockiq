import path from "path";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: path.join(__dirname, "prisma/schema.prisma"),
  },
  migrate: {
    adapter: async () => {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { neonConfig, Pool } = await import("@neondatabase/serverless");
      neonConfig.webSocketConstructor = (await import("ws")).default;
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      return new PrismaNeon(pool);
    },
  },
} satisfies PrismaConfig;
