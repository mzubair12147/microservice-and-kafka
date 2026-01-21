import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { Inject, Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import bcrypt from "bcrypt";
import {SALT_ROUNDS} from "@app/common"

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly databaseService: DatabaseService
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async register(email: string, name: string, password: string) {
    const existingUser = await this.databaseService.db.select().from(users).where(eq(users.email, email))
    if(existingUser){
      throw new ConflictException("User already exist");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS );

    const [user] = await this.databaseService.db.insert(users).values({
      email, name, password: hashedPassword
    }).returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id, email: user.email, timestamp: new Date().toISOString()
    })

    return {message: "User registered successfully"};
  }
}
