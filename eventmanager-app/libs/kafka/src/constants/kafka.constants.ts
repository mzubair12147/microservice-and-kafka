
// tells where kafka running
export const KAFKA_BROKER = process.env.KAFKA_BROKER ?? "localhost:29092";

// acts as a unique identifier for your app
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? "eventmanagerapp";

// acts as a group identifer to which services will belong to
export const KAFKA_CONSUMER_GROUP = process.env.KAFKA_CONSUMER_GROUP ?? "eventmanagerapp-consumer"

// topics
export const KAFKA_TOPICS = {
    // auth events
    USER_REGISTERED : "user.registered",
    USER_LOGIN: "user.login",
    PASSWORD_RESET_REQUEST: "user.password-reset-request",

    // Event events
    EVENT_UPDATED: "event.updated",
    EVENT_CREATED: "event.created",
    EVENT_DELETED: "event.deleted",
    EVENT_CANCELLED: "event.cancelled",

    // Ticket events
    TICKET_PURCHASED: "ticket.purchased",
    TICKET_CANCELLED: "ticket.cancelled",
    TICKET_CHECKED_IN: "ticket.checked-in",

    // Payment events
    PAYMENT_COMPLETED: "payment.completed",
    PAYMENT_FAILED: "payment.failed",

    // Notifications triggers
    SENT_EMAIL: "notification.send-email",
    SEND_PUSH : "notification.send-push"
} as const;

export type KafkaTopics = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
