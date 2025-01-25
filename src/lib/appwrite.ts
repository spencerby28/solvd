import { Client, Account, Databases, Users, Teams } from 'node-appwrite';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public';
import { APPWRITE_KEY } from '$env/static/private';


export const SESSION_COOKIE = 'solvd';
export { ID, Query, Role } from 'node-appwrite';
export type { AppwriteException } from 'node-appwrite';

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)
        .setKey(APPWRITE_KEY);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        },
        get users() {
            return new Users(client);
        },
        get teams() {
            return new Teams(client);
        }
    };
}

export function createAnonClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT);

    return {
        get databases() {
            return new Databases(client);
        },
        get client() {
            return client;
        },
        get account() {
            return new Account(client);
        }
    };
}

export function createSessionClient(event: any) {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT);

    // Extract our custom domain's session cookie from the request
    const session = event.cookies.get(SESSION_COOKIE);
    if (!session) {
        throw new Error("No user session");
    }

    client.setSession(session);
  //  console.log('client', client);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        }
    
    };
}