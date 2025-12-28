# AI Report Builder - User Guide

## 🚀 Revolutionary Feature: Talk to AI, Get Reports

The **AI Report Builder** is a game-changing conversational interface that lets you create professional structured product reports through natural conversation—no forms, no hassle.

---

## 🎯 How It Works

### **Traditional Manual Mode**
1. Fill 20+ form fields manually
2. Validate inputs
3. Click generate
4. Wait for report
**Time: ~20 minutes**

### **New AI Mode** 
1. Click "AI Mode" button
2. Chat naturally with AI
3. AI asks smart questions
4. AI fetches live market data
5. Report auto-generates
**Time: ~2 minutes** ⚡

---

## 💬 Example Conversations

### **Quick & Direct**
```
You: "12-month reverse convertible on Apple, 70% barrier, 10% coupon"

AI: Perfect! I've got:
    ✅ Product: Reverse Convertible
    ✅ Underlying: AAPL - Apple Inc.
    ✅ Current Price: $178.42
    ✅ Tenor: 12 months
    ✅ Barrier: 70%
    ✅ Coupon: 10% p.a.
    
    What notional amount?

You: "100k"

AI: Excellent! Your report is ready to generate 🎉
```

### **Guided Conversation**
```
AI: Hi! What would you like to create today?

You: "Something for a conservative client"

AI: For conservative clients, I suggest:
    • Reverse Convertible with high barrier (75-80%)
    • Capital Protected Note with guaranteed floor
    
    Which sounds better?

You: "Capital protected"

AI: Great choice! Which underlying stock?

You: "Microsoft"

AI: Found: MSFT - Microsoft Corporation
    Current Price: $415.23 ✅
    
    For conservative clients, I suggest:
    • 100% capital protection
    • 120% upside participation
    • 12-month tenor
    
    Does this work?

You: "Perfect"

AI: What's the investment amount?

You: "250k"

AI: All set! Ready to generate your report 🎉
```

### **Voice Input**
```
🎤 [Click microphone button]

You: (speaking) "Create a bonus certificate on Tesla with 108% bonus and 60% barrier for 18 months"

AI: Got it! I heard:
    ✅ Product: Bonus Certificate
    ✅ Underlying: TSLA
    ✅ Bonus: 108%
    ✅ Barrier: 60%
    ✅ Tenor: 18 months
    
    Just need the notional amount and we're done!
```

---

## 🎨 Features

### **1. Live Market Data Integration**
- AI fetches current stock prices automatically
- Suggests barriers based on volatility
- Shows real-time market context
- Validates ticker symbols

### **2. Smart Suggestions**
- AI recommends sensible defaults
- Adjusts based on risk profile
- Explains why certain parameters make sense
- Warns about risky configurations

### **3. Voice Input** 🎤
- Click microphone to speak
- AI transcribes and processes
- Perfect for mobile or hands-free
- Supports natural speech patterns

### **4. Quick Templates**
Pre-configured templates for common scenarios:
- **Conservative RC** - High barrier, moderate coupon
- **Aggressive RC** - Lower barrier, high coupon
- **Full Protection CPPN** - 100% protected, leveraged upside
- **Bonus Hunter** - Bonus certificate with cushion

### **5. Real-Time Preview**
- See report building as you chat
- Progress indicator (0-100%)
- Field-by-field completion status
- Missing fields highlighted

### **6. Intelligent Validation**
- AI validates inputs in real-time
- Catches errors before generation
- Suggests corrections
- Ensures compliance with product rules

---

## 🎯 Switching Between Modes

### **From Manual → AI Mode**
Click the **"AI Mode"** button in the header (gradient purple button with sparkle)

### **From AI → Manual Mode**
Click **"Manual Mode"** in AI Builder header (will confirm before switching)

### **Both Modes Coexist**
- Manual mode: Full control, traditional forms
- AI mode: Fast, conversational, guided
- Choose based on preference and use case
- No conflict—completely separate workflows

---

## 💡 Pro Tips

### **Be Natural**
```
✅ "I need a 12-month note on Apple"
✅ "Create reverse convertible, AAPL, 70% barrier"
✅ "Conservative protected note for Microsoft"
❌ Don't overthink it—just chat!
```

### **Use Voice for Speed**
- Click 🎤 microphone
- Speak naturally
- AI handles the rest
- Perfect for quick setups

### **Let AI Guide You**
- If unsure, just say "I don't know"
- AI will suggest options
- Click quick reply buttons
- AI explains concepts when needed

### **Review Before Generate**
- Check live preview panel
- Verify all fields
- Progress shows 100% when ready
- Click "Generate Report & PDF"

---

## 🔧 Technical Details

### **AI Model**
- **Primary**: GPT-4 Turbo (will upgrade to GPT-5.2 when API available)
- **Fallback**: GPT-4o-mini
- **Optimized for**: Financial reasoning, parameter extraction, validation

### **Data Sources**
- **Live Quotes**: Financial Modeling Prep (FMP) API
- **Company Info**: FMP Company Profiles
- **Volatility**: Calculated from price history
- **Suggestions**: AI-generated based on market data

### **Performance**
- **Chat Response**: 1-3 seconds
- **Market Data**: 0.5-1 second per ticker
- **Full Generation**: 10-15 seconds (all formats)
- **Caching**: 5-minute TTL for market data

### **Privacy & Security**
- Conversations not stored permanently
- API keys secured via environment variables
- No sensitive data sent to AI (only product parameters)
- Compliant with financial data regulations

---

## 📊 What Gets Generated

When you click "Generate Report & PDF":

1. **Full PDF Report** (2 pages)
2. **Client Email** (ready to send)
3. **Executive Summary** (1 page)
4. **Investment Memo** (formal approval doc)
5. **FAQ Sheet** (Q&A for clients)
6. **Meeting Prep Pack** (talking points)

**All generated simultaneously in ~15 seconds!**

---

## 🐛 Troubleshooting

### **AI Not Responding**
- Check OpenAI API key in `.env`
- Verify internet connection
- Try refreshing the page

### **Voice Input Not Working**
- Use Chrome/Edge (best support)
- Allow microphone permissions
- Check browser console for errors

### **Market Data Not Loading**
- Check FMP API key in `.env`
- Verify ticker symbol is valid
- Try alternative ticker

### **Report Generation Fails**
- Ensure all required fields are complete (100%)
- Check for validation errors in preview
- Try manual mode as fallback

---

## 🎓 Best Practices

### **For Financial Advisors**
- Use templates for common scenarios
- Let AI suggest barriers based on volatility
- Review AI-generated client emails before sending
- Customize tone based on client relationship

### **For Structurers**
- Provide specific parameters if you know them
- Use voice input for rapid prototyping
- Leverage AI suggestions for market context
- Export multiple formats for different audiences

### **For Compliance**
- Review all AI-generated content
- Verify parameters match guidelines
- Check risk disclosures
- Ensure suitability for client profile

---

## 🚀 Future Enhancements

### **Coming Soon**
- [ ] GPT-5.2 Thinking model integration
- [ ] Multi-language support
- [ ] Saved conversation history
- [ ] Custom templates
- [ ] Direct email sending
- [ ] Portfolio analysis integration
- [ ] Comparison mode (multiple products)

### **Roadmap**
- **Q1 2026**: Advanced voice commands
- **Q2 2026**: Video explanations
- **Q3 2026**: Mobile app with voice-first UX
- **Q4 2026**: AI portfolio advisor integration

---

## 📞 Support

### **Need Help?**
- Check this guide first
- Try manual mode as fallback
- Contact support with specific error messages
- Share conversation logs for debugging

### **Feedback**
We're constantly improving! Share your experience:
- What worked well?
- What was confusing?
- Feature requests?
- Bug reports?

---

## 🎉 Why This Changes Everything

**Before AI Mode:**
- Forms feel tedious
- Easy to make mistakes
- Time-consuming
- Requires product expertise

**After AI Mode:**
- Conversations feel natural
- AI validates everything
- Lightning fast
- AI explains as you go

**This is the future of structured products! 🚀**

---

**Last Updated:** December 28, 2025  
**Version:** 1.0  
**Status:** Production Ready

