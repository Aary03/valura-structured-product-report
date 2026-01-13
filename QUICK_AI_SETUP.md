# ⚡ Quick AI Setup (60 seconds)

## Step 1: Get OpenAI API Key (30 sec)
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)

## Step 2: Add to Project (15 sec)
Create `.env` file in project root:
```env
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

## Step 3: Install Package (10 sec)
```bash
npm install openai
```

## Step 4: Use Component (5 sec)
```tsx
<StandalonePositionCard
  position={data}
  marketPrices={prices}
  showAI={true}  // ← AI enabled!
/>
```

## ✅ Done!

Refresh page → See AI insights appear in purple panel.

**That's all you need!** 🎉

---

## 🐛 If Not Working:

**Check:**
```bash
# 1. API key set?
cat .env | grep OPENAI

# 2. Package installed?
npm list openai

# 3. Restart server
npm run dev
```

**Check browser console:**
- Should see: "Generating AI insights..."
- If errors: Check API key is valid

---

**Help:** See `docs/guides/HOW_TO_USE_AI_FEATURES.md` for details
