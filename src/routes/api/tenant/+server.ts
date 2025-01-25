import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { RequestEvent } from '@sveltejs/kit';
import { Query } from 'node-appwrite';

export async function GET({ request }: RequestEvent) {
    try {
        const client = createAdminClient();
        const teams = client.teams;

        const result = await teams.list();

        return json(result);

    } catch (error) {
        console.error('Error fetching teams:', error);
        return json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}
export async function POST({ request }: RequestEvent) {
    try {
        const { tenantId, role, userId, currentTenant } = await request.json();

        const {teams, users} = createAdminClient();

        // Delete user from current tenant
        console.log('currentTenant', currentTenant);
        const currentMemberships = await teams.listMemberships(currentTenant);
        for (const membership of currentMemberships.memberships) {
            if (membership.userId === userId) {
                await teams.deleteMembership(
                    currentTenant,
                    membership.$id
                );
                break;
            }
        }

        // Create new membership in selected tenant
        const result = await teams.createMembership(
            tenantId,
            [role],
            undefined, // email
            userId,    // userId
            undefined, // phone
            undefined, // url
            undefined  // name
        );

        // Update user preferences with new tenant
        await users.updatePrefs(userId, {
            tenantId: tenantId
        });

        return json(result);

    } catch (error) {
        console.error('Error managing team membership:', error);
        return json({ error: 'Failed to manage team membership' }, { status: 500 });
    }
}
