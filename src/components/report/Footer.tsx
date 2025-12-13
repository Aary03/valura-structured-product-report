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
    <div className="mt-8 pt-6 border-t border-grey-border flex justify-between items-center text-sm text-grey-medium">
      <div>
        <span className="font-semibold">Underlyings</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>Date: {date}</span>
        <span>Document ID: {documentId}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}

