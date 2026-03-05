'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-force';
import { motion } from 'framer-motion';

interface Node {
    id: string;
    name: string;
    type: 'org' | 'person' | 'infra';
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

interface Link {
    source: string | Node;
    target: string | Node;
}

const NODES: Node[] = [
    { id: 'org_wagner', name: 'Wagner Group', type: 'org' },
    { id: 'org_osint', name: 'OSINT Collective', type: 'org' },
    { id: 'p_yevgeny', name: 'Identity 129', type: 'person' },
    { id: 'p_john', name: 'John Doe', type: 'person' },
    { id: 'i_svr', name: 'Command Server', type: 'infra' },
    { id: 'i_domain', name: 'Dark Ops Portal', type: 'infra' },
];

const LINKS: Link[] = [
    { source: 'org_wagner', target: 'p_yevgeny' },
    { source: 'p_yevgeny', target: 'i_svr' },
    { source: 'org_wagner', target: 'i_domain' },
    { source: 'org_osint', target: 'p_john' },
    { source: 'p_john', target: 'i_domain' },
];

export default function EntityGraph({ selectedEntityId, onSelectEntity }: { selectedEntityId: string | null, onSelectEntity: (id: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>(NODES);
    const [links, setLinks] = useState<any[]>(LINKS);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const simulation = d3.forceSimulation(NODES as any)
            .force('link', d3.forceLink(LINKS).id((d: any) => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', () => {
                setNodes([...NODES]);
                setLinks([...LINKS]);
            });

        return () => {
            simulation.stop();
        };
    }, []);

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'org': return '#f0a500'; // Orange
            case 'person': return '#a371f7'; // Purple
            case 'infra': return '#58a6ff'; // Blue
            default: return '#8b949e';
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#161b22] to-[#010409]">
            <svg className="w-full h-full">
                {/* Links */}
                {links.map((link, i) => (
                    <line
                        key={`link-${i}`}
                        x1={link.source.x}
                        y1={link.source.y}
                        x2={link.target.x}
                        y2={link.target.y}
                        stroke="#30363d"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node) => (
                    <g
                        key={node.id}
                        transform={`translate(${node.x || 0},${node.y || 0})`}
                        onClick={() => onSelectEntity(node.id)}
                        className="cursor-pointer"
                    >
                        <circle
                            r={selectedEntityId === node.id ? 20 : 16}
                            fill={getNodeColor(node.type)}
                            stroke={selectedEntityId === node.id ? '#ffffff' : '#0d1117'}
                            strokeWidth={selectedEntityId === node.id ? 3 : 2}
                            className="transition-all duration-200 hover:brightness-125"
                        />
                        <text
                            y={32}
                            textAnchor="middle"
                            fill={selectedEntityId === node.id ? '#ffffff' : '#8b949e'}
                            className="text-xs font-mono select-none"
                            style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}
                        >
                            {node.name}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
