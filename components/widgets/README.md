# Advanced Widget System 🎨

Een volledig dynamisch en 100% aanpasbaar widget systeem voor de Bonsai AI Chat Platform.

## Features ✨

### 🎯 3 Widget Types
- **Chat Bubble**: Classic floating chat button (cirkel, vierkant, afgerond)
- **Zoekbalk**: Een elegante search bar met icon en placeholder
- **Custom Box**: Een volledig aanpasbare box met icon, tekst en meer

### 📍 9-Grid Positionering
Plaats je widget overal op het scherm:
- **Top**: Links, Center, Rechts
- **Middle**: Links, Center, Rechts  
- **Bottom**: Links, Center, Rechts

Plus fijnafstelling met X/Y offset (in pixels)!

### 🎨 Volledige Kleuren Customization
- Widget achtergrond & tekstkleur
- Header achtergrond & tekstkleur
- Gebruiker berichten kleur
- Bot berichten kleur
- Berichten tekstkleur
- Alle kleuren instelbaar met color picker + hex input

### 🎭 Remixicon Integration
- **2500+ icons** uit Remixicon library
- Zoekfunctie met categorieën
- Live preview van geselecteerde icon
- Populaire icons voor snelle toegang

### ⚙️ Geavanceerde Opties

#### Layout Tab
- Widget type selectie
- 9-grid position picker (visueel)
- Horizontal/vertical offsets
- Bubble shape (cirkel, vierkant, afgerond)
- Bubble size (klein, normaal, groot, custom)
- Custom afmetingen (40-200px)
- Chat window dimensions (300-800px breed, 400-900px hoog)

#### Styling Tab
- Icon picker (Remixicon)
- Widget tekst (optioneel, max 20 chars)
- Alle kleuren configureerbaar
- Border radius sliders voor chat & berichten (0-50px)

#### Behavior Tab
- Greeting message (max 500 chars)
- Input placeholder
- Auto-open toggle met delay (0-60000ms)
- Branding toggle

#### Advanced Tab
- Z-index configuratie (1-999999)
- Custom CSS editor (max 10000 chars)
- Pro tips voor CSS selectors

### 🔴 Live Preview
Real-time preview met:
- Alle styling veranderingen direct zichtbaar
- Demo website achtergrond
- Widget info (type, positie, grootte, chat dimensions)
- Quick tips

## Component Overzicht

### 1. `RemixiconPicker.tsx`
Icon picker met zoek en filter functionaliteit.

```tsx
<RemixiconPicker
  value="RiChat1Line"
  onChange={(iconName) => setIcon(iconName)}
  size={24}
/>
```

### 2. `PositionPicker.tsx`
Visuele 9-grid position selector.

```tsx
<PositionPicker
  value="bottom-right"
  onChange={(position) => setPosition(position)}
/>
```

### 3. `AdvancedWidgetEditor.tsx`
Main editor met 4 tabs (Layout, Styling, Behavior, Advanced).

```tsx
<AdvancedWidgetEditor
  config={widgetConfig}
  onChange={setWidgetConfig}
/>
```

### 4. `WidgetLivePreview.tsx`
Real-time preview component.

```tsx
<WidgetLivePreview config={widgetConfig} />
```

### 5. `CreateWidgetModal.tsx`
Updated modal die alle nieuwe components integreert.

## Widget Configuration Interface

```typescript
interface WidgetConfig {
  // Basic
  name: string;
  widgetType: 'bubble' | 'searchbar' | 'custom-box';
  
  // Layout
  position: string; // 9 options
  offsetX?: number;
  offsetY?: number;
  
  // Bubble/Icon
  bubbleIcon?: string; // RemixIcon name
  bubbleText?: string;
  bubbleShape: 'circle' | 'square' | 'rounded-square';
  bubbleSize: 'small' | 'medium' | 'large' | 'custom';
  bubbleWidth?: number;
  bubbleHeight?: number;
  
  // Colors (all hex)
  bubbleBackgroundColor: string;
  bubbleTextColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  userMessageColor: string;
  botMessageColor: string;
  messageTextColor: string;
  
  // Chat Window
  chatWidth: number;
  chatHeight: number;
  chatBorderRadius: number;
  messageBorderRadius: number;
  
  // Behavior
  greeting?: string;
  placeholder: string;
  autoOpen?: boolean;
  autoOpenDelay?: number;
  
  // Advanced
  customCss?: string;
  zIndex?: number;
  showBranding?: boolean;
}
```

## Backend Changes

### Database Schema (Prisma)
Toegevoegd aan `Widget` model:
```prisma
widgetType    String    @default("bubble")
offsetX       Int       @default(0)
offsetY       Int       @default(0)
```

Plus alle bestaande styling velden die al aanwezig waren.

### Routes Validation
Updated `widget.routes.ts` Zod schema:
```typescript
widgetType: z.enum(["bubble", "searchbar", "custom-box"]).optional(),
position: z.enum([...9 positions...]).optional(),
offsetX: z.number().int().min(-500).max(500).optional(),
offsetY: z.number().int().min(-500).max(500).optional(),
```

### Widget Service
`widget.service.ts` ondersteunt nu:
- Alle nieuwe velden bij create/update
- 9-grid positioning in rendered widget
- Offset calculations
- widgetType rendering

## Migration Required

Na deze changes moet je een Prisma migration draaien:

```bash
cd Ai-project
npx prisma migrate dev --name add_widget_type_and_offsets
```

## Gebruik

1. Open de widget modal
2. Vul naam en selecteer een agent
3. Kies je widget type (bubble/searchbar/custom-box)
4. **Layout Tab**: Kies positie, vorm, grootte
5. **Styling Tab**: Kies icon, kleuren, border radius
6. **Behavior Tab**: Stel greeting, auto-open, etc. in
7. **Advanced Tab**: Custom CSS, z-index
8. Bekijk live preview rechts
9. Klik "Widget Aanmaken"

## Tips 💡

### Voor Gebruikers
- Gebruik de live preview om je widget real-time te zien
- Probeer verschillende posities met de visual grid picker
- Custom CSS selectors: `#ai-chat-bubble`, `#ai-chat-window`
- Offset is handig voor fijnafstelling (bijv. -10px voor iets dichter bij de rand)

### Voor Developers
- Alle components zijn volledig typed met TypeScript
- State management via simple useState (kan later naar Zustand/Redux)
- Preview component gebruikt inline styles voor snelheid
- Icon picker is optimized (max 100 icons getoond tegelijk)
- Modal gebruikt `size="full"` voor meer ruimte

## Browser Support

Getest in:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

Remixicon CSS wordt via CDN geladen (4.6.0).

## Future Enhancements

Mogelijke uitbreidingen:
- [ ] Drag & drop voor position
- [ ] Color themes/presets
- [ ] Widget templates
- [ ] A/B testing voor widgets
- [ ] Analytics per widget type
- [ ] Custom animations
- [ ] Multiple widgets per pagina
- [ ] Conditional display rules
- [ ] Mobile-specific settings

## License

Onderdeel van het Bonsai AI Chat Platform.
