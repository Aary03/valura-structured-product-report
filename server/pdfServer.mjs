import express from 'express';
import { chromium } from 'playwright';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Avoid noisy favicon / CSP-related console warnings when someone opens the PDF server in a browser
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// Friendly status page (this server is API-only)
app.get('/', (_req, res) => {
  res
    .status(200)
    .type('text/plain')
    .send(
      [
        'Valura PDF server (API-only)',
        '',
        'POST /api/reports/pdf  -> returns a 2-page A4 PDF',
        '',
        'Usage:',
        '- Start the Vite app:   http://localhost:5173',
        '- Start this server:    npm run pdf:server',
        '- Click "Download PDF" inside the app',
      ].join('\n')
    );
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

/**
 * POST /api/reports/pdf
 * Body: { reportData, filename, meta }
 * Renders the internal PDF-only route (`/?pdf=1`) and prints as exactly 2 pages.
 */
app.post('/api/reports/pdf', async (req, res) => {
  const { reportData, filename, meta } = req.body || {};
  if (!reportData) {
    res.status(400).send('Missing reportData');
    return;
  }

  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const pdfUrl = `${appUrl}/?pdf=1`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }, // ~A4 at 96dpi
      deviceScaleFactor: 1,
    });

    // Inject last report into sessionStorage before the app runs
    await page.addInitScript((data) => {
      try {
        window.sessionStorage.setItem('valura:lastReport', JSON.stringify(data));
      } catch {}
    }, reportData);

    await page.goto(pdfUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__PDF_READY__ === true, { timeout: 30_000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      // Full-bleed (no outer browser margins). We manage layout padding in `pdf.css`.
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      // We render a styled header/footer inside the PDF page DOM for perfect brand control.
      displayHeaderFooter: false,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'report.pdf'}"`);
    res.status(200).send(pdfBuffer);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).send('Failed to generate PDF');
  } finally {
    await browser.close();
  }
});

const port = Number(process.env.PDF_PORT || 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PDF server listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Using APP_URL=${process.env.APP_URL || 'http://localhost:5173'}`);
});


