import type { Models } from "appwrite";

export type TicketStatus = 
    // Core
    | 'NEW'
    | 'OPEN' 
    | 'WORKING'
    | 'ESCALATED'
    | 'SOLVD';

export interface Messages extends Models.Document {
    content: string;
    sender_id: string;
    sender_name: string;
    sender_type: string;
    channel: string;
    ticket_id: string;
    tenant_id: string;
    attachments?: string[];
    read_status?: boolean;
    edited?: boolean;
    email_message_id?: string;
    email?: string;
    subject?: string;
    is_welcome?: boolean;
    internal?: boolean;
}

export interface ChatSessions extends Models.Document {
    session_id: string;
    tenant_id: string;
    status: string;
    last_activity: Date;
    customer_id?: string;
    ticket_id?: string;
    current_category?: string;
    browser?: string;
    platform?: string;
    ip_address?: string;
}

export interface Presence extends Models.Document {
    session_id: string;
    tenant_id: string;
    status: string;
    last_ping: Date;
    customer_id?: string;
}

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
    email_thread_id?: string;
    customer_email?: string;
    pinned?: boolean;
    last_message?: string;
    replied?: boolean;
    converted?: boolean;
    inbox_id?: string;
}

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
}

export interface CreateMessagePayload {
    subject: string;
    channel: string;
    content: string;
    sender_id: string;
    customer_id: string;
    sender_name: string;
    sender_type: 'customer' | 'system' | 'ai' | 'agent';
    ticket_id: string;
    tenant_id: string;
    attachments?: string[];
    email?: string;
    internal?: boolean;
}

export interface Tenants extends Models.Document {
    tenant_name: string;
    user_ids: string[];
    primary_contact_email: string;
    business_email_domain: string;
    billing_email: string;
    created_at: Date;
    updated_at: Date;
    avatar_url?: string;
    phone_number?: string;
    subscription_tier?: string;
    subscription_status?: string;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
    industry?: string;
    company_size?: number;
    is_active?: boolean;
}
export interface HelpType {
    type: 'order' | 'product' | 'returns' | 'help';
    content: string;
}