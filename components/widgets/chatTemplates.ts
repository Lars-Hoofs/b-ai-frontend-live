import { nanoid } from 'nanoid';
import { ChatBlock } from './AdvancedWidgetEditor';

// Default Chat Structure
export const DEFAULT_CHAT_STRUCTURE: ChatBlock[] = [
    {
        id: nanoid(),
        type: 'header',
        style: {
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        children: [
            {
                id: nanoid(),
                type: 'container',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                },
                children: [
                    {
                        id: nanoid(),
                        type: 'container', // Avatar/Icon container
                        style: {
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        },
                        children: [
                            {
                                id: nanoid(),
                                type: 'icon',
                                content: 'RiRobot2Line',
                                style: { fontSize: '20px' }
                            }
                        ]
                    },
                    {
                        id: nanoid(),
                        type: 'container',
                        style: { display: 'flex', flexDirection: 'column', gap: '2px' },
                        children: [
                            {
                                id: nanoid(),
                                type: 'text',
                                content: 'Chat Support',
                                style: {
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    color: '#111827'
                                }
                            },
                            {
                                id: nanoid(),
                                type: 'container',
                                style: { display: 'flex', alignItems: 'center', gap: '6px' },
                                children: [
                                    {
                                        id: nanoid(),
                                        type: 'container',
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#10b981'
                                        }
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'text',
                                        content: 'We\'re here to help',
                                        style: {
                                            fontSize: '12px',
                                            color: '#6b7280'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: nanoid(),
                type: 'button',
                icon: 'RiCloseLine',
                onClick: 'close-chat',
                style: {
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#6b7280'
                },
                hoverStyle: {
                    backgroundColor: '#f3f4f6',
                    color: '#111827'
                }
            }
        ]
    },
    {
        id: nanoid(),
        type: 'messages',
        style: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }
    },
    {
        id: nanoid(),
        type: 'input',
        placeholder: 'Type your message...',
        style: {
            padding: '20px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
        },
        children: [
            {
                id: nanoid(),
                type: 'container', // Input wrapper
                style: {
                    flex: 1,
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '32px',
                    padding: '6px 6px 6px 20px',
                    border: '1px solid transparent'
                }
            },
            {
                id: nanoid(),
                type: 'button',
                icon: 'RiSendPlane2Fill',
                onClick: 'send-message',
                style: {
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                hoverStyle: {
                    backgroundColor: '#4f46e5',
                    transform: 'scale(1.05)'
                }
            }
        ]
    }
];

// Chat Templates
export const CHAT_TEMPLATES = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean chat with minimal header',
        structure: [
            {
                id: nanoid(),
                type: 'header' as const,
                style: { padding: '16px 20px', backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' },
                children: [
                    { id: nanoid(), type: 'text' as const, content: 'Chat', style: { fontWeight: '600', fontSize: '16px' } },
                    { id: nanoid(), type: 'button' as const, icon: 'RiCloseLine', onClick: 'close-chat' as const, style: { background: 'none', border: 'none', cursor: 'pointer' } }
                ]
            },
            { id: nanoid(), type: 'messages' as const, style: { flex: 1, overflowY: 'auto', padding: '20px', background: '#fafafa' } },
            {
                id: nanoid(),
                type: 'input' as const,
                placeholder: 'Message...',
                style: { padding: '16px', borderTop: '1px solid #eee' }
            }
        ]
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Business chat with avatar and status',
        structure: DEFAULT_CHAT_STRUCTURE
    },
    {
        id: 'modern',
        name: 'Modern',
        description: 'Gradient header with floating input',
        structure: [
            {
                id: nanoid(),
                type: 'header' as const,
                style: {
                    padding: '24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                },
                children: [
                    { id: nanoid(), type: 'text' as const, content: 'Support Chat', style: { fontWeight: '700', fontSize: '20px' } },
                    { id: nanoid(), type: 'button' as const, icon: 'RiCloseLine', onClick: 'close-chat' as const, style: { color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px' } }
                ]
            },
            { id: nanoid(), type: 'messages' as const, style: { flex: 1, overflowY: 'auto', padding: '24px', background: '#f8f9fa' } },
            { id: nanoid(), type: 'input' as const, placeholder: 'Type here...', style: { padding: '20px 24px', background: '#fff', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' } }
        ]
    },
    {
        id: 'complete',
        name: 'Complete',
        description: 'Full-featured chat with branding',
        structure: [
            ...DEFAULT_CHAT_STRUCTURE,
            {
                id: nanoid(),
                type: 'branding' as const,
                content: 'Powered by Bonsai',
                url: 'https://bonsaimedia.nl',
                style: {
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb'
                }
            }
        ]
    },
    {
        id: 'dark-mode',
        name: 'Dark Elegance',
        description: 'Premium dark mode layout with sleek borders',
        structure: [
            {
                id: nanoid(), type: 'header' as const,
                style: { padding: '20px 24px', backgroundColor: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '12px' },
                children: [
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #3f3f46' },
                        children: [{ id: nanoid(), type: 'icon' as const, content: 'RiRobot2Fill', style: { color: '#e4e4e7', fontSize: '20px' } }]
                    },
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
                        children: [
                            { id: nanoid(), type: 'text' as const, content: 'AI Assistant', style: { fontWeight: '600', fontSize: '15px', color: '#f4f4f5' } },
                            {
                                id: nanoid(), type: 'container' as const, style: { display: 'flex', alignItems: 'center', gap: '6px' },
                                children: [
                                    { id: nanoid(), type: 'container' as const, style: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } },
                                    { id: nanoid(), type: 'text' as const, content: 'Online', style: { fontSize: '11px', color: '#a1a1aa' } }
                                ]
                            }
                        ]
                    },
                    { id: nanoid(), type: 'button' as const, icon: 'RiCloseLine', onClick: 'close-chat' as const, style: { background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '4px' } }
                ]
            },
            { id: nanoid(), type: 'messages' as const, style: { flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#09090b', backgroundImage: 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)' } },
            {
                id: nanoid(), type: 'input' as const, placeholder: 'Ask me anything...',
                style: { padding: '16px 24px', borderTop: '1px solid #27272a', backgroundColor: '#18181b', display: 'flex', gap: '12px', alignItems: 'center' },
                children: [
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { flex: 1, display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#27272a', borderRadius: '24px', padding: '8px 8px 8px 16px', border: '1px solid #3f3f46' }
                    },
                    {
                        id: nanoid(), type: 'button' as const, icon: 'RiSendPlaneFill', onClick: 'send-message' as const,
                        style: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                    }
                ]
            }
        ]
    },
    {
        id: 'ios',
        name: 'iOS Style',
        description: 'Familiar iMessage-style interface',
        structure: [
            {
                id: nanoid(), type: 'header' as const,
                style: { padding: '12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' },
                children: [
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db' },
                        children: [{ id: nanoid(), type: 'icon' as const, content: 'RiCustomerService2Fill', style: { color: '#9ca3af', fontSize: '24px' } }]
                    },
                    { id: nanoid(), type: 'text' as const, content: 'Support', style: { fontWeight: '600', fontSize: '11px', color: '#111827' } },
                    { id: nanoid(), type: 'button' as const, icon: 'RiArrowDownSLine', onClick: 'close-chat' as const, style: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' } }
                ]
            },
            { id: nanoid(), type: 'messages' as const, style: { flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#ffffff' } },
            {
                id: nanoid(), type: 'input' as const, placeholder: 'iMessage',
                style: { padding: '12px 16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', gap: '8px', alignItems: 'center' },
                children: [
                    { id: nanoid(), type: 'button' as const, icon: 'RiAddLine', onClick: 'open-url' as const, style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer' } },
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { flex: 1, display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '20px', padding: '4px 4px 4px 12px', border: '1px solid #d1d5db' }
                    },
                    {
                        id: nanoid(), type: 'button' as const, icon: 'RiArrowUpLine', onClick: 'send-message' as const,
                        style: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                    }
                ]
            }
        ]
    },
    {
        id: 'glass',
        name: 'Glassmorphism',
        description: 'Vibrant backdrop-blur style',
        structure: [
            {
                id: nanoid(), type: 'header' as const,
                style: { padding: '20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                children: [
                    {
                        id: nanoid(), type: 'container' as const, style: { display: 'flex', alignItems: 'center', gap: '12px' },
                        children: [
                            {
                                id: nanoid(), type: 'container' as const,
                                style: { width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(255,107,107,0.3)' },
                                children: [{ id: nanoid(), type: 'icon' as const, content: 'RiSparklingFill', style: { color: 'white', fontSize: '20px' } }]
                            },
                            { id: nanoid(), type: 'text' as const, content: 'Bonsai Magic', style: { fontWeight: '800', fontSize: '16px', color: '#1f2937', letterSpacing: '-0.02em' } }
                        ]
                    },
                    { id: nanoid(), type: 'button' as const, icon: 'RiCloseLine', onClick: 'close-chat' as const, style: { background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '32px', height: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }
                ]
            },
            { id: nanoid(), type: 'messages' as const, style: { flex: 1, overflowY: 'auto', padding: '24px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' } },
            {
                id: nanoid(), type: 'input' as const, placeholder: 'Message...',
                style: { padding: '16px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.3)', display: 'flex', gap: '12px', alignItems: 'center' },
                children: [
                    {
                        id: nanoid(), type: 'container' as const,
                        style: { flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', padding: '10px 10px 10px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }
                    },
                    {
                        id: nanoid(), type: 'button' as const, icon: 'RiSendPlaneFill', onClick: 'send-message' as const,
                        style: { width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(255,107,107,0.3)' }
                    }
                ]
            }
        ]
    }
];
