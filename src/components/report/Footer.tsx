/**
 * Footer Component
 * Date, document ID, page number
 */

interface FooterProps {
  date: string;
  documentId: string;
}

export function Footer({ date, documentId }: FooterProps) {
  return (
    <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-xs text-text-secondary no-print">
      <div className="font-semibold text-text-secondary">
        Valura • Indicative terms • Not an offer
      </div>
      <div className="flex items-center space-x-4">
        <span>Generated: {date}</span>
        <span>Document ID: {documentId}</span>
      </div>
    </div>
  );
}

