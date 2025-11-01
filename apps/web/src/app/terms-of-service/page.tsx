import { readFile } from 'fs/promises';
import { join } from 'path';
import ReactMarkdown from 'react-markdown';

export default async function TermsOfServicePage() {
  // In production, you might want to load from a CMS or database
  // For now, we'll use the markdown file
  let termsContent = '';
  
  try {
    const filePath = join(process.cwd(), 'docs/terms-of-service.md');
    termsContent = await readFile(filePath, 'utf-8');
  } catch (error) {
    // Fallback if file not found
    termsContent = '# Terms of Service\n\nContent loading...';
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{termsContent}</ReactMarkdown>
      </div>
    </div>
  );
}
