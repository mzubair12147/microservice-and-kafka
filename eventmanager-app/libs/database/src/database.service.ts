import {Injectable, OnModuleDestroy} from "@nestjs/common";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private pool: Pool;
    public db: NodePgDatabase<typeof schema>;

    constructor(){
        const connectionString = process.env.DATABASE_URL;
        if(!connectionString){
            throw new Error("Database url is not set");
        }

        this.pool = new Pool({
            connectionString: connectionString
        })

        this.db = drizzle(this.pool, {schema});

        console.log("database is connected");
    }

    get schema(){
        return schema;
    }

    onModuleDestroy() {
        this.pool.end();
    }
}