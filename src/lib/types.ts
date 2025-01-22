import type { Models } from "appwrite";

export type TicketStatus = 
    // Core
    | 'new'
    | 'open'
    | 'pending'
    | 'resolved'
    | 'closed'
    // AI-specific
    | 'ai_handling'
    | 'ai_pending'
    | 'ai_escalated'
    // Other
    | 'escalated'
    | 'spam'
    | 'reopened';

export interface Messages extends Models.Document {
    content: string;
    sender_id: string;
    sender_name: string;
    sender_type: string;
    source: string;
    ticket_id: string;
    tenant_id: string;
    attachments?: string[];
    read_status?: boolean;
    edited?: boolean;
};

export interface Tickets extends Models.Document {
    customer_id: string;
    channel: string;
    category: string;
    last_active: Date;
    customer_name: string;
    customer_last_seen: Date;
    customer_locale: string;
    customer_timezone: string;
    messages?: string[];
    assigned_to?: string;
    assigned_name?: string;
    internal_messages?: string[];
    subject?: string;
    tenant_id?: string;
    priority?: string;
    status?: TicketStatus;
};
export interface Customers extends Models.Document {
    name: string;
    locale: string;
    timezone: string;
    status: string;
    tenant_id: string;
    email?: string;
    instagram_id?: string;
    instagram_username?: string;
    shopify_id?: string;
    tickets?: string[];
};
