# 🚀 Widget Overhaul - Deployment Guide

## Overzicht

Frontend op Vercel ✅ (Auto-deploy via Git)  
Backend op Ubuntu VPS met Docker 🐳 (Handmatige migratie nodig)

---

## ✅ Wat is Klaar

### Frontend (Vercel) - 100% Klaar
- ✅ TypographyTab.tsx - Complete typography controls
- ✅ AvatarGradientEditor.tsx - Avatar gradient editor  
- ✅ AdvancedWidgetEditor.tsx - Updated met nieuwe WidgetConfig
- ✅ InteractiveChatPreview.tsx - Klaar voor nieuwe styling
- ✅ Alle TypeScript interfaces bijgewerkt

### Backend (VPS) - Code Klaar, Migratie Nodig
- ✅ Prisma schema uitgebreid met 30+ nieuwe fields
- ✅ Zod validation schema bijgewerkt
- ✅ Widget routes config endpoint uitgebreid
- ⏳ **DATABASE MIGRATIE MOET NOG UITGEVOERD WORDEN**

---

## 📋 Deployment Checklist

### **Stap 1: Backend Migratie (VPS)** ⚠️ BELANGRIJK

SSH naar je VPS en voer de database migratie uit:

```bash
# 1. SSH connectie
ssh your-user@your-vps-ip

# 2. Ga naar backend directory
cd /path/to/b3-v  # Pas aan naar jouw pad

# 3. Pull de laatste code (als je Git gebruikt)
git pull origin main

# 4. Stop de Docker containers
docker-compose down

# 5. Run de Prisma migratie
npx prisma migrate deploy

# Dit voegt de nieuwe columns toe aan de Widget table:
# - fontFamily, fontSize, fontWeight, lineHeight, letterSpacing
# - avatarGradient, avatarBorderColor, avatarBorderWidth, avatarSize
# - attachmentStyle, showAttachmentPreviews, attachmentIconStyle
# - gsapEnabled, gsapBubbleEntry, gsapChatEntry, gsapMessageEntry, gsapDuration, gsapEase
# - messageShadow, messageSpacing, messageMaxWidth
# - headerGradient, headerShadow, headerPadding

# 6. Genereer Prisma Client opnieuw
npx prisma generate

# 7. Rebuild Docker image met nieuwe schema
docker-compose build

# 8. Start containers opnieuw
docker-compose up -d

# 9. Check of alles werkt
docker-compose logs -f backend
```

#### Alternative: Migratie in Docker Container

Als je de migratie in de container wilt draaien:

```bash
# Stop containers
docker-compose down

# Start alleen database
docker-compose up -d db

# Run migratie in container context
docker-compose run --rm backend npx prisma migrate deploy

# Genereer client
docker-compose run --rm backend npx prisma generate

# Build en start alles
docker-compose up -d --build

```

---

### **Stap 2: Frontend Deploy (Vercel)** ✅ AUTO

De frontend deploy automatisch zodra je pusht naar Git:

```bash
# Op je lokale machine:
cd "C:\Users\Admin\Desktop\b-ai-frontend-live"

# Check status
git status

# Stage alle wijzigingen  
git add .

# Commit
git commit -m "✨ Widget Overhaul: Typography, Avatar Gradients, GSAP Animations

- Added complete typography system with Google Fonts
- Modern avatar gradients wie Sunset, Ocean, Fire presets
- GSAP animation options for bubble, chat, and messages
- File attachment styling controls
- Message bubble and header enhancements
- 100+ new customization options"

# Push naar repository
git push origin main
```

**Vercel zal automatisch:**
1. Detecteren dat er nieuwe code is
2. Build starten (Next.js compile)
3. TypeScript type-check uitvoeren
4. Deployen naar productie (~2-3 minuten)
5. Notificatie sturen als deploy klaar is

---

## 🧪 Testing

### Backend Testen (na migratie)

```bash
# Check database schema
docker-compose exec db psql -U postgres -d your_database -c "\d widgets"

# Dit moet de nieuwe columns tonen:
# - fontFamily (text)
# - fontSize (jsonb)
# - fontWeight (jsonb)
# ... etc

# Test API endpoint
curl -X GET https://your-backend-url/api/widgets/config/TEST_INSTALL_CODE

# Response moet nieuwe fields bevatten
```

### Frontend Testen (na deploy)

1. Ga naar https://your-vercel-app.com/dashboard/widgets
2. Edit een bestaande widget
3. Check of "Typografie" tab zichtbaar is
4. Test Google Fonts selector
5. Test Avatar Gradient editor
6. Sla wijzigingen op
7. Bekijk preview

---

## 📁 Gewijzigde Bestanden Overzicht

### **Frontend**
```
components/widgets/
├── TypographyTab.tsx              ✨ NEW
├── AvatarGradientEditor.tsx       ✨ NEW
├── AdvancedWidgetEditor.tsx       🔧 MODIFIED (+150 lines)
├── InteractiveChatPreview.tsx     ✅ KLAAR (render logic)
└── WIDGET_OVERHAUL_README.md      ✨ NEW (documentatie)
```

### **Backend**  
```
prisma/
└── schema.prisma                  🔧 MODIFIED (+50 lines)
    
src/routes/
└── widget.routes.ts               🔧 MODIFIED (+120 lines)
    
src/services/
└── widget.service.ts              ✅ NO CHANGES NEEDED (spreads input)
```

---

## 🔥 Troubleshooting

### "Migratie failed: Column already exists"

Als je de migratie al eerder hebt uitgevoerd maar niet succesvol:

```bash
# Reset migratie status
npx prisma migrate resolve --rolled-back <migration-name>

# Probeer opnieuw
npx prisma migrate deploy
```

### "Type errors in frontend"

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### "Backend returnt niet alle nieuwe fields"

Check of:
1. Prisma client is geregenereerd: `npx prisma generate`
2. Backend is ge-rebuild: `docker-compose build`
3. Containers zijn herstart: `docker-compose restart`

### "Vercel deploy failed"

Check Vercel logs:
- Ga naar Vercel dashboard
- Click op je project
- Kijk bij "Deployments" → laatste deployment → "View Function Logs"
- Zoek naar TypeScript errors

Meestal oplossing:
```bash
# Run TypeScript check lokaal
npm run build

# Fix errors, commit, push
```

---

## 💡 Tips

### Lokaal Testen Voordat je Deploy

**Backend:**
```bash
# Test of migratie werkt zonder productie te raken
# Gebruik een test database

# In .env.test:
DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"

# Run migratie op test
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
```

**Frontend:**
```bash
# Run production build lokaal
npm run build
npm run start

# Test op localhost:3000
```

### Rollback Plan

Als er iets misgaat:

**Backend:**
```bash
# Rollback laatste migratie
npx prisma migrate resolve --rolled-back <migration-name>

# Restore database backup (maak eerst backup!)
pg_restore -d your_database backup.sql
```

**Frontend:**
```bash
# Revert Git commit
git revert HEAD
git push origin main

# Vercel deployed automatisch oude versie
```

---

## ✅ Deployment Success Checklist

- [ ] Backend migratie succesvol uitgevoerd
- [ ] Docker containers herstart
- [ ] Prisma client gegenereerd
- [ ] Frontend code gepusht naar Git
- [ ] Vercel deployment successful
- [ ] Typography tab zichtbaar in dashboard
- [ ] Avatar Gradient editor werkt
- [ ] Nieuwe widgets kunnen worden aangemaakt met nieuwe fields
- [ ] Bestaande widgets blijven werken (backwards compatible)
- [ ] Widget preview toont nieuwe styling options

---

## 📞 Support

Als je problemen hebt:

1. **Check logs:**
   - Backend: `docker-compose logs -f backend`
   - Vercel: Dashboard → Deployments → View Logs

2. **Check database:**
   ```bash
   docker-compose exec db psql -U postgres -d your_db -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'widgets';"
   ```

3. **Verify API:**
   ```bash
   curl https://your-api.com/api/widgets/config/test | jq .
   ```

---

## 🎉 Na Deployment

### Features Testen

1. **Typography:**
   - Selecteer "Inter" font
   - Pas header size aan naar 20px
   - Sla op en bekijk widget

2. **Avatar Gradient:**
   - Enable avatar gradient
   - Kies "Sunset" preset
   - Check preview

3. **Animations:**
   - Enable GSAP
   - Kies "bounceIn" voor bubble
   - Test in browser

### Performance Check

- Widget laadtijd < 2s
- Google Font laadt async
- Gradients zijn smooth
- Animations zijn 60fps

---

**Je bent nu klaar! 🚀**

De widget heeft nu een complete overhaul met:
- ✅ Modern typography system
- ✅ Gradient avatars
- ✅ GSAP animations
- ✅ 100% customizable
- ✅ Professional look

**Veel succes met de deployment! 💪**
