
import { nanoid } from 'nanoid';
import type { LauncherBlock } from './AdvancedWidgetEditor';

interface LauncherTemplate {
    id: string;
    name: string;
    description: string;
    structure: LauncherBlock[];
}

export const LAUNCHER_TEMPLATES: LauncherTemplate[] = [
    {
        id: 'pill-chat',
        name: 'Simple Pill',
        description: 'A friendly pill-shaped button with icon and text.',
        structure: [
            {
                id: nanoid(),
                type: 'container',
                style: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                },
                hoverStyle: {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
                onClick: 'toggle-chat',
                children: [
                    {
                        id: nanoid(),
                        type: 'icon',
                        content: 'RiChat1Line',
                        style: { width: '24px', height: '24px' }
                    },
                    {
                        id: nanoid(),
                        type: 'text',
                        content: 'Chat with us',
                        style: { fontWeight: '600', fontSize: '14px' }
                    }
                ]
            }
        ]
    },
    {
        id: 'fab-stack',
        name: 'Action Stack',
        description: 'Vertical stack with separate buttons for Chat, Email and WhatsApp.',
        structure: [
            {
                id: nanoid(),
                type: 'column', // Flex-col container
                style: {
                    gap: '12px',
                    alignItems: 'flex-end',
                },
                children: [
                    // Email Button
                    {
                        id: nanoid(),
                        type: 'container',
                        onClick: 'email',
                        linkUrl: 'support@example.com',
                        style: {
                            backgroundColor: '#ffffff',
                            color: '#333',
                            borderRadius: '50%',
                            width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        hoverStyle: { transform: 'scale(1.1)' },
                        children: [{ id: nanoid(), type: 'icon', content: 'RiMailLine', style: { width: '20px' } }]
                    },
                    // WhatsApp / Phone Button
                    {
                        id: nanoid(),
                        type: 'container',
                        onClick: 'phone',
                        linkUrl: '+31612345678',
                        style: {
                            backgroundColor: '#ffffff',
                            color: '#333',
                            borderRadius: '50%',
                            width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        hoverStyle: { transform: 'scale(1.1)' },
                        children: [{ id: nanoid(), type: 'icon', content: 'RiWhatsappLine', style: { width: '20px' } }]
                    },
                    // Main Chat Button
                    {
                        id: nanoid(),
                        type: 'container',
                        onClick: 'toggle-chat',
                        style: {
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '64px', height: '64px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        },
                        hoverStyle: { transform: 'rotate(10deg) scale(1.05)' },
                        children: [{ id: nanoid(), type: 'icon', content: 'RiChat1Fill', style: { width: '28px' } }]
                    }
                ]
            }
        ]
    },
    {
        id: 'promo-bar',
        name: 'Promo Bar',
        description: 'Full width bar at the bottom with a CTA.',
        structure: [
            {
                id: nanoid(),
                type: 'container',
                style: {
                    width: '320px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                children: [
                    {
                        id: nanoid(),
                        type: 'column',
                        style: { gap: '4px' },
                        children: [
                            { id: nanoid(), type: 'text', content: 'Need help?', style: { fontWeight: 'bold', fontSize: '14px' } },
                            { id: nanoid(), type: 'text', content: 'Our AI agents are ready.', style: { fontSize: '12px', color: '#666' } }
                        ]
                    },
                    {
                        id: nanoid(),
                        type: 'container',
                        onClick: 'toggle-chat',
                        style: {
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: '600',
                        },
                        hoverStyle: { opacity: 0.8 },
                        children: [{ id: nanoid(), type: 'text', content: 'Start Chat' }]
                    }
                ]
            }
        ]
    }
];
