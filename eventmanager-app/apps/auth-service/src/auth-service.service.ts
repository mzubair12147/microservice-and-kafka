import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { Inject, Injectable, OnModuleInit, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@app/common"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly databaseService: DatabaseService,
    private readonly jwtService : JwtService
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async register(email: string, name: string, password: string) {
    const [existingUser] = await this.databaseService.db.select().from(users).where(eq(users.email, email))
    if (existingUser) {
      throw new ConflictException("User already exist");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await this.databaseService.db.insert(users).values({
      email, name, password: hashedPassword
    }).returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id, email: user.email, timestamp: new Date().toISOString()
    })

    return { message: "User registered successfully" };
  }

  async login(email: string, password: string){
    console.log(email, password);
    const [user] = await this.databaseService.db.select().from(users).where(eq(users.email, email));
    if(!user) throw new ConflictException("User with this email not exist");

    const passwordValid = await bcrypt.compare(password, user.password);

    if(!passwordValid) throw new ConflictException("Password is not correct");

    const token = this.jwtService.sign({sub: user.id, email: user.email});

    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
      userId: user.id,
      timestamp : new Date().toISOString()
    })

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name, 
        email: user.email,
        role: user.role
      }
    }
  }

  async getProfile(userId: string){
    const [user] = await this.databaseService.db.select({
      id: users.id,
      name: users.name,
      email: users.name,
      role: users.role
    }).from(users).where(eq(users.id, userId));

    if(!user) throw new UnauthorizedException("User not Found");

    return user; 
  }
}
