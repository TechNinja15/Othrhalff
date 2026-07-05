import Dexie, { Table } from 'dexie';

export interface LocalMessage {
  id: string; // Either UUID from Supabase or temp string like temp-123
  match_id: string;
  sender_id: string;
  text: string;
  created_at: number; // Storing as timestamp number for easier sorting
  is_read: boolean;
  is_system: boolean;
  status: 'sent' | 'sending' | 'failed';
  reaction?: string;
}

<<<<<<< HEAD
export class ChatDatabase extends Dexie {
  messages!: Table<LocalMessage, string>;

  constructor() {
    super('OthrhalffChatDB');
=======
export interface LocalProfile {
  id: string;
  real_name: string | null;
  anonymous_id: string;
  avatar: string | null;
  is_verified: boolean;
  university: string | null;
  last_fetched: number; // Storing as timestamp number for TTL checks
}

export class ChatDatabase extends Dexie {
  messages!: Table<LocalMessage, string>;
  profiles!: Table<LocalProfile, string>;

  constructor() {
    super('OthrhalffCupidDB');
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
    this.version(1).stores({
      messages: 'id, match_id, created_at, status'
    });
    this.version(2).stores({
      messages: 'id, match_id, created_at, status, [match_id+created_at]'
    });
<<<<<<< HEAD
=======
    this.version(3).stores({
      messages: 'id, match_id, created_at, status, [match_id+created_at]',
      profiles: 'id'
    });
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
  }
}

export const db = new ChatDatabase();
