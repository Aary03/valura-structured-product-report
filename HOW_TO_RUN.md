# How to Run Valura Structured Products Project

**Last Updated:** May 28, 2026  
**Project:** Structured Product Term Sheet Generator  
**Tech Stack:** React + TypeScript + Vite

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Node.js 18+** installed ([Download here](https://nodejs.org/))
- ✅ **npm** (comes with Node.js) or yarn
- ✅ **Git** (if cloning from repository)
- ✅ **Terminal/Command Line** access

**Check your Node version:**
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 8.x or higher
```

---

## 🚀 Quick Start (Step-by-Step)

### Step 1: Navigate to Project Directory

```bash
cd /Users/aaryanbarnwal/Valura-sp-termsheet
```

### Step 2: Install Dependencies

If you haven't installed dependencies yet (or if `node_modules` folder is missing):

```bash
npm install
```

This will install all required packages:
- React & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Recharts (for graphs)
- Axios (for API calls)
- Lucide React (icons)
- Express & Playwright (for PDF generation)

**Expected output:**
```
added 300+ packages in ~30s
```

### Step 3: Environment Setup (IMPORTANT!)

The project requires API keys. These are already configured in your `.env` file:

```env
# Financial Modeling Prep API Key (for stock data)
VITE_FMP_API_KEY=bEiVRux9rewQy16TXMPxDqBAQGIW8UBd

# OpenAI API Key (for AI insights)
VITE_OPENAI_API_KEY=sk-proj-BExiJx...

# Marketaux API Key (for news - optional)
VITE_MARKETAUX_API_KEY=
```

✅ **Already configured!** No action needed.

⚠️ **If `.env` file is missing,** create it in the project root with the above content.

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 5: Open in Browser

Open your browser and go to:

```
http://localhost:5173
```

🎉 **You should see the Valura Structured Products app running!**

---

## 📦 Available Commands

### Development Commands

```bash
# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter (check code quality)
npm run lint

# Start PDF generation server (for PDF exports)
npm run pdf:server
```

### Common Workflows

#### 1. **Development Mode (Most Common)**
```bash
npm run dev
```
- App runs on `http://localhost:5173`
- Auto-reloads when you save files
- Shows errors in browser console

#### 2. **Generate PDFs**
You need to run TWO terminals:

**Terminal 1:** Main app
```bash
npm run dev
```

**Terminal 2:** PDF server
```bash
npm run pdf:server
```

Now PDF export button will work in the app.

#### 3. **Production Build**
```bash
npm run build
npm run preview
```
- Creates optimized build in `dist/` folder
- Preview runs on `http://localhost:4173`

---

## 🗂️ Project Structure

```
/Users/aaryanbarnwal/Valura-sp-termsheet/
├── src/                          # Source code
│   ├── components/              # React components
│   │   ├── report/             # Report cards (Hero, Graphs, etc.)
│   │   ├── input/              # Product input forms
│   │   ├── news/               # News components
│   │   └── export/             # Export functionality
│   ├── products/               # Product logic
│   │   ├── reverseConvertible/        # RC calculations
│   │   └── capitalProtectedParticipation/  # CPPN calculations
│   ├── services/               # API services
│   │   ├── api/               # Market data APIs
│   │   └── ai/                # AI services (OpenAI)
│   ├── hooks/                  # React hooks
│   ├── pages/                  # Main pages
│   └── App.tsx                 # Main app component
├── server/                      # PDF generation server
│   └── pdfServer.mjs
├── public/                      # Static assets
├── docs/                        # Documentation
├── .env                         # Environment variables (API keys)
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
└── tailwind.config.js          # Tailwind CSS config
```

---

## 🌐 Application Features

Once the app is running, you can:

### 1. **Generate Product Reports**
- Navigate to the main page
- Select product type:
  - Regular Income (Reverse Convertible)
  - Capital Protection (CPPN)
  - Boosted Growth (Bonus Certificate)
- Enter product parameters
- Click "Generate Report"

### 2. **View Report Cards**
The report includes 13+ interactive cards:
- Hero Header (KPIs)
- One-Minute Summary
- Product Summary
- Underlyings Data
- Payoff Graph
- Break-Even Analysis
- Scenario Outcomes
- And more...

### 3. **AI Features**
- AI Report Builder (conversational)
- Company Investment Insights
- Export to various formats (Email, Memo, FAQ)

### 4. **Export Options**
- Download PDF (requires PDF server running)
- Export to Word/Google Docs
- Email format
- Investment memo format

---

## 🔑 API Keys Explained

### 1. **Financial Modeling Prep (FMP)**
- **Purpose:** Real-time stock prices, historical data
- **Already configured:** `VITE_FMP_API_KEY`
- **Free tier:** 250 requests/day
- **Get your own:** [financialmodelingprep.com](https://financialmodelingprep.com/)

### 2. **OpenAI**
- **Purpose:** AI insights, report generation
- **Already configured:** `VITE_OPENAI_API_KEY`
- **Models used:** GPT-4 Turbo, GPT-4o-mini
- **Get your own:** [platform.openai.com](https://platform.openai.com/)

### 3. **Marketaux (Optional)**
- **Purpose:** Financial news
- **Not required:** App works without it
- **Get your own:** [marketaux.com](https://marketaux.com/)

---

## 🐛 Troubleshooting

### Problem: "Port 5173 is already in use"

**Solution:**
```bash
# Kill the process on port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or use a different port:
npm run dev -- --port 3000
```

### Problem: "Cannot find module or its dependencies"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "API key invalid" error

**Solution:**
1. Check `.env` file exists
2. Make sure keys are correct
3. Restart dev server (Ctrl+C, then `npm run dev`)
4. Vite requires restart after `.env` changes

### Problem: PDF export not working

**Solution:**
1. Make sure PDF server is running:
   ```bash
   npm run pdf:server
   ```
2. Check console for errors
3. Ensure Playwright is installed:
   ```bash
   npx playwright install
   ```

### Problem: "Module not found" TypeScript errors

**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

---

## 🔄 Common Development Tasks

### Adding New Dependencies
```bash
npm install package-name
npm install -D package-name  # For dev dependencies
```

### Updating Dependencies
```bash
npm update
```

### Checking for Outdated Packages
```bash
npm outdated
```

### Running Linter
```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues
```

---

## 🏗️ Build for Production

### Step 1: Build
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 2: Test Production Build Locally
```bash
npm run preview
```

Opens at `http://localhost:4173`

### Step 3: Deploy
Upload the `dist/` folder to your hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

---

## 📱 Accessing from Other Devices

To access the app from your phone or another computer on the same network:

```bash
npm run dev -- --host
```

Then access at:
```
http://YOUR_LOCAL_IP:5173
```

Find your local IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

## 🎯 What to Do Next

### If Running for First Time:

1. ✅ **Verify installation:** `npm run dev` works
2. ✅ **Generate a report:** Test with AAPL stock
3. ✅ **Check PDF generation:** Start PDF server
4. ✅ **Explore documentation:** Read `REPORT_CARDS_COMPLETE_GUIDE.md`

### For Development:

1. Read `REPORT_CARDS_COMPLETE_GUIDE.md` - Understand all cards
2. Check `PRODUCT_FIELDS_SPECIFICATION.md` - Product types
3. Explore `src/components/report/` - Report components
4. Check `src/products/` - Calculation engines

### For Production Deployment:

1. Update API keys in production `.env`
2. Run `npm run build`
3. Test with `npm run preview`
4. Deploy `dist/` folder
5. Set environment variables on hosting platform

---

## 📚 Additional Resources

- **Complete Card Documentation:** `REPORT_CARDS_COMPLETE_GUIDE.md`
- **Product Specifications:**
  - `REGULAR_INCOME_SPEC.md` (Reverse Convertible)
  - `CAPITAL_PROTECTION_SPEC.md` (CPPN)
  - `BONUS_CERTIFICATE_SPEC.md` (Bonus)
- **Main README:** `README.md`
- **AI Features:** `README_AI_FEATURES.md`

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the console:** Browser DevTools (F12) → Console
2. **Check terminal:** Look for error messages
3. **Clear cache:** Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. **Restart dev server:** Ctrl+C then `npm run dev`
5. **Reinstall dependencies:** `rm -rf node_modules && npm install`

---

## ✅ Quick Reference Card

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Start PDF server | `npm run pdf:server` |
| Build for production | `npm run build` |
| Preview production | `npm run preview` |
| Run linter | `npm run lint` |
| Clear cache | `rm -rf node_modules/.vite` |

**Default URLs:**
- Development: `http://localhost:5173`
- Production Preview: `http://localhost:4173`
- PDF Server: `http://localhost:3001`

---

**Ready to build amazing structured product reports! 🚀**

For detailed documentation on how everything works, see `REPORT_CARDS_COMPLETE_GUIDE.md`.
