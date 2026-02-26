import React from 'react';

// --- Launcher Block ---
export interface LauncherBlock {
    id: string;
    type: 'container' | 'row' | 'column' | 'icon' | 'text' | 'image' | 'split' | 'status';
    content?: string;
    style?: React.CSSProperties;
    className?: string;
    children?: LauncherBlock[];
    onClick?: 'open-chat' | 'toggle-chat' | 'open-link' | 'email' | 'phone';
    linkUrl?: string;
    hoverStyle?: React.CSSProperties;
    mobileHidden?: boolean;
    splitRatio?: number; // e.g., 30 for 30/70 split
    statusType?: 'online' | 'offline' | 'away';
}

// --- Chat Block ---
export interface ChatBlock {
    id: string;
    type: 'header' | 'messages' | 'input' | 'container' | 'text' | 'button' | 'divider' | 'branding' | 'icon' | 'image' | 'split' | 'status';
    content?: string;
    style?: Record<string, any>;
    className?: string;
    children?: ChatBlock[];
    position?: 'top' | 'bottom' | 'left' | 'right';
    placeholder?: string;
    icon?: string;
    onClick?: 'send-message' | 'close-chat' | 'custom' | 'open-url';
    url?: string;
    hoverStyle?: Record<string, any>;
    mobileHidden?: boolean;
    splitRatio?: number;
    statusType?: 'online' | 'offline' | 'away';
}

// --- Full Widget Config ---
export interface WidgetConfig {
    id?: string;
    workspaceId?: string;
    name: string;
    agentId?: string;
    widgetType?: 'bubble' | 'full-page' | 'embed' | 'searchbar' | 'custom-box';

    // Layout
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'middle-right' | 'middle-left' | 'top-center' | 'bottom-center' | 'middle-center';
    offsetX?: number;
    offsetY?: number;
    layoutMode?: 'fixed' | 'percentage' | 'full-height' | 'full-width' | 'custom';
    widthPercentage?: number;
    heightPercentage?: number;
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    zIndex?: number;

    // Launcher
    bubbleIcon?: string;
    bubbleText?: string;
    bubbleShape?: 'circle' | 'square' | 'rounded-square';
    bubbleSize?: 'small' | 'medium' | 'large' | 'custom';
    bubbleWidth?: number;
    bubbleHeight?: number;
    bubbleImageUrl?: string;
    bubbleImageFit?: 'cover' | 'contain' | 'fill';
    bubbleShadow?: string;

    // Animation
    enableAnimation?: boolean;
    animationType?: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
    animationDirection?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    animationDuration?: number;
    animationDelay?: number;
    hoverAnimation?: 'scale' | 'lift' | 'pulse' | 'none' | 'grow' | 'rotate';

    // Image/Icon
    imageIconRelation?: 'icon-only' | 'image-only' | 'image-bg-icon-overlay' | 'split' | 'cover' | 'overlay' | 'side-by-side';
    imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'background';
    imageFullHeight?: boolean;

    // Colors
    primaryColor?: string;
    bubbleBackgroundColor?: string;
    bubbleTextColor?: string;
    bubbleIconColor?: string;
    headerBackgroundColor?: string;
    headerTextColor?: string;
    userMessageColor?: string;
    userMessageTextColor?: string;
    botMessageColor?: string;
    botMessageTextColor?: string;
    borderColor?: string;

    // Bubble Hover
    bubbleHoverBackgroundColor?: string;
    bubbleHoverTextColor?: string;
    bubbleHoverIconColor?: string;
    bubbleHoverScale?: number;

    // Header
    headerCloseIcon?: string;
    headerCloseIconColor?: string;
    headerCloseIconHoverColor?: string;
    headerCloseIconBackgroundColor?: string;
    headerCloseIconHoverBackgroundColor?: string;
    onlineStatusColor?: string;
    avatarBackgroundColor?: string;
    showAgentAvatar?: boolean;
    showOnlineStatus?: boolean;
    headerAvatarUrl?: string;
    headerAvatarEmoji?: string;
    headerTitle?: string;
    headerSubtitle?: string;

    // Chat Area
    chatBackgroundColor?: string;

    // Input
    inputBorderColor?: string;
    inputFocusBorderColor?: string;
    inputBackgroundColor?: string;
    inputTextColor?: string;
    inputPlaceholderColor?: string;
    inputAreaBackgroundColor?: string;
    inputAreaBorderColor?: string;
    typingIndicatorColor?: string;

    // Send Button
    sendButtonIcon?: string;
    sendButtonBackgroundColor?: string;
    sendButtonIconColor?: string;
    sendButtonHoverBackgroundColor?: string;
    sendButtonHoverIconColor?: string;

    // Advanced Styling
    backgroundGradient?: { from: string; to: string; direction?: string };
    backdropBlur?: number;
    borderWidth?: number;
    shadowIntensity?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    glassEffect?: boolean;

    // Chat Window
    greeting?: string;
    placeholder?: string;
    chatWidth?: number;
    chatHeight?: number;
    chatBorderRadius?: number;
    messageBorderRadius?: number;
    chatAnimation?: string;
    chatOffsetX?: number;
    chatOffsetY?: number;

    // Behavior
    autoOpen?: boolean;
    autoOpenDelay?: number;
    soundEnabled?: boolean;
    suggestedQuestions?: string[];

    // AI Mode
    aiOnlyMode?: boolean;
    aiOnlyMessage?: string;

    // Avatar
    avatarGradient?: { from: string; to: string; direction: string };
    avatarSize?: number;
    avatarBorderColor?: string;
    avatarBorderWidth?: number;

    // Typography
    fontFamily?: string;
    fontSize?: { header?: number; message?: number; input?: number };
    fontWeight?: { header?: number; message?: number; input?: number };
    lineHeight?: { header?: number; message?: number; input?: number };
    letterSpacing?: { header?: number; message?: number; input?: number };
    workingHours?: any;
    holidays?: any;

    // Branding
    showBranding?: boolean;
    brandingText?: string;
    brandingUrl?: string;

    // Sources
    showSources?: boolean;
    maxVisibleSources?: number;

    // Advanced Launcher
    launcherMode?: 'simple' | 'advanced';
    launcherStructure?: LauncherBlock[];

    // Advanced Chat
    chatMode?: 'simple' | 'advanced';
    chatStructure?: ChatBlock[];

    // Custom
    customCss?: string;
}

// --- Helpers ---
export const ensureHex = (color: string) => {
    if (!color) return undefined;
    if (color.length === 4 && color.startsWith('#')) {
        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color;
};
