import { Module, OnModuleDestroy } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

// Token used to inject the Mongo "Db" instance elsewhere
const MONGO_DB = 'MONGO_DB';

@Module({
  providers: [
    {
      provide: MONGO_DB,
      useFactory: async (): Promise<Db> => {
        // For tests/dev you can enable an in-memory Mongo by setting USE_IN_MEMORY_MONGO=true
        if (process.env.USE_IN_MEMORY_MONGO === 'true') {
          // Use CommonJS require to avoid Jest vm-modules flag requirement
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mem = await MongoMemoryServer.create();
          const uri = mem.getUri();
          const client = new MongoClient(uri);
          await client.connect();
          const dbName = (await client.db().admin().listDatabases()).databases[0]?.name || 'test';
          return client.db(dbName);
        }
        // In normal runs, prefer MONGODB_URI if present, otherwise build a URI from parts
        const uriFromEnv = process.env.MONGODB_URI;

        const host = process.env.MONGODB_DATABASE_HOST || 'localhost';
        const username = process.env.MONGODB_USERNAME || 'placeholder';
        const password = process.env.MONGODB_PASSWORD || 'placeholder';
        const dbName = process.env.MONGODB_DB || 'placeholder';

        // If you store full URI in secrets, we use it directly
        // Otherwise, compose a URI from host/username/password/dbName
        const uri = uriFromEnv
          ? uriFromEnv
          : `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:27017/${dbName}?authSource=admin`;

        const client = new MongoClient(uri);
        await client.connect();
        // Return the connected database instance
        return client.db(dbName);
      },
    },
  ],
  exports: [MONGO_DB],
})
export class MongodbModule implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    // Best-effort note: Native driver does not expose a global registry; clients
    // are owned by providers and closed when the process exits.
  }
}

export { MONGO_DB };

 