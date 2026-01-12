# Environment Variables Setup

## Required API Keys

To use all features of the Valura Structured Products platform, you need to set up the following environment variables:

### 1. Financial Modeling Prep API Key
```bash
VITE_FMP_API_KEY=your_fmp_api_key_here
```
- **Used for**: Company data, quotes, financial statements, analyst ratings
- **Get your key**: https://site.financialmodelingprep.com/developer/docs
- **Free tier**: Available

### 2. OpenAI API Key (NEW - Required for AI Insights)
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```
- **Used for**: AI Investment Insights, company summary generation
- **Get your key**: https://platform.openai.com/api-keys
- **Model used**: GPT-4o-mini (cost-effective)
- **Estimated cost**: ~$0.001 per insight, ~$0.0005 per Q&A

### 3. Marketaux API Key
```bash
VITE_MARKETAUX_API_KEY=your_marketaux_api_key_here
```
- **Used for**: Financial news and market pulse
- **Get your key**: https://www.marketaux.com/
- **Free tier**: Available

## Setup Instructions

### Local Development

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your API keys to `.env`:
   ```env
   VITE_FMP_API_KEY=your_actual_fmp_key
   VITE_OPENAI_API_KEY=your_actual_openai_key
   VITE_MARKETAUX_API_KEY=your_actual_marketaux_key
   ```

3. The `.env` file is already in `.gitignore` and will not be committed

4. Restart your dev server:
   ```bash
   npm run dev
   ```

### Production Deployment

Set environment variables in your hosting platform:

**Vercel:**
```bash
vercel env add VITE_FMP_API_KEY
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_MARKETAUX_API_KEY
```

**Netlify:**
- Go to Site Settings → Environment Variables
- Add each variable with its value

**Other platforms:**
- Consult your platform's documentation for setting environment variables

## Feature Availability

| Feature | Required API Key |
|---------|------------------|
| Basic Reports | `VITE_FMP_API_KEY` |
| Company Data | `VITE_FMP_API_KEY` |
| Historical Prices | `VITE_FMP_API_KEY` |
| Analyst Ratings | `VITE_FMP_API_KEY` |
| News Feed | `VITE_MARKETAUX_API_KEY` |
| **AI Investment Insights** | `VITE_OPENAI_API_KEY` ⭐ |
| **Interactive Q&A** | `VITE_OPENAI_API_KEY` ⭐ |

## Security Notes

- **Never commit** `.env` files to version control
- **Never hardcode** API keys in source code
- **Rotate keys** periodically for security
- **Use different keys** for development and production
- **Monitor usage** to detect unauthorized access

## Troubleshooting

### AI Insights Not Loading
- ✅ Check that `VITE_OPENAI_API_KEY` is set
- ✅ Verify the key is valid at https://platform.openai.com/api-keys
- ✅ Check browser console for API errors
- ✅ Ensure you have available API credits

### "Missing API Key" Errors
- ✅ Restart dev server after adding keys to `.env`
- ✅ Verify variable names match exactly (including `VITE_` prefix)
- ✅ Check that `.env` file is in project root

### Rate Limiting
- FMP: 250 requests/day (free tier)
- OpenAI: Based on your plan
- Marketaux: 100 requests/day (free tier)

## Cost Optimization

### OpenAI API (AI Insights)
- **Model**: GPT-4o-mini (most cost-effective)
- **Per insight**: ~$0.001
- **Per Q&A**: ~$0.0005
- **100 insights**: ~$0.10
- **Caching**: Implement to reduce costs (future enhancement)

### Recommendations
1. Start with free tiers to test
2. Upgrade FMP for higher limits if needed
3. Monitor OpenAI usage dashboard
4. Consider caching strategies for production

---

**Questions?** Check the main README.md or AI_INSIGHTS_FEATURE.md for more details.




