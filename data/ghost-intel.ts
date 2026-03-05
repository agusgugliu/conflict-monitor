export interface IntelEntity {
    id: string;
    name: string;
    type: 'org' | 'person' | 'infra';
    role?: string;
    info?: string;
    alias?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'COMPROMISED';
    confidence: number;
    connections: string[]; // IDs of other entities
    summary: string;
    lastSeen: string;
}

export const INTEL_ENTITIES: IntelEntity[] = [
    {
        id: 'org_wagner',
        name: 'Wagner Group',
        type: 'org',
        role: 'PMC / Proxy Force',
        status: 'ACTIVE',
        confidence: 98,
        connections: ['p_yevgeny_ghost', 'org_unit_29155', 'i_command_srv'],
        summary: 'Non-state armed group operating in support of regional objectives. Linked to decentralized command structures.',
        lastSeen: '2026-03-05T12:00:00Z'
    },
    {
        id: 'org_unit_29155',
        name: 'Unit 29155',
        type: 'org',
        role: 'Special Operations',
        status: 'ACTIVE',
        confidence: 92,
        connections: ['org_wagner', 'p_shadow_lead'],
        summary: 'Specialized unit focused on unconventional warfare and kinetic actions in foreign territories.',
        lastSeen: '2026-03-04T18:30:00Z'
    },
    {
        id: 'org_apt28',
        name: 'APT28 (Fancy Bear)',
        type: 'org',
        role: 'Cyber Espionage',
        status: 'ACTIVE',
        confidence: 99,
        connections: ['i_dark_ops_portal', 'i_command_srv'],
        summary: 'Advanced persistent threat group specializing in cyber reconnaissance and data extraction.',
        lastSeen: '2026-03-05T09:15:00Z'
    },
    {
        id: 'p_yevgeny_ghost',
        name: 'Identity 129',
        alias: '@phantom_lead',
        type: 'person',
        role: 'Field Commander',
        status: 'ACTIVE',
        confidence: 85,
        connections: ['org_wagner'],
        summary: 'High-value target overseeing logistics and field operations in restricted zones.',
        lastSeen: '2026-03-05T15:45:00Z'
    },
    {
        id: 'p_shadow_lead',
        name: 'Operative X-RAY',
        alias: 'Specter',
        type: 'person',
        role: 'Signals Intel Lead',
        status: 'ACTIVE',
        confidence: 94,
        connections: ['org_unit_29155', 'i_dark_ops_portal'],
        summary: 'Technical lead for tactical signal interception and localized electronic warfare.',
        lastSeen: '2026-03-05T08:20:00Z'
    },
    {
        id: 'i_command_srv',
        name: 'C2 Command Server',
        info: '185.112.45.90',
        type: 'infra',
        status: 'ACTIVE',
        confidence: 100,
        connections: ['org_wagner', 'org_apt28'],
        summary: 'Main command and control server for decentralized telemetry collection.',
        lastSeen: '2026-03-05T17:10:00Z'
    },
    {
        id: 'i_dark_ops_portal',
        name: 'Shadow Gate',
        info: 'v7x-ops.onion',
        type: 'infra',
        status: 'ACTIVE',
        confidence: 91,
        connections: ['org_apt28', 'p_shadow_lead'],
        summary: 'Anonymous coordination portal for relaying tactical instructions to field operatives.',
        lastSeen: '2026-03-05T16:00:00Z'
    }
];
