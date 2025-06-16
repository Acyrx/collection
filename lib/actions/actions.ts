'use server';

import { analyzeEducationalContent } from '@/ai/flows/analyze-educational-content';
import { summarizeEducationalContent } from '@/ai/flows/summarize-educational-content';

export type ScrapeResult =
  | { success: true; educational: true; summary: string }
  | { success: true; educational: false; reason: string }
  | { success: false; error: string };

async function fetchContent(url: string): Promise<string> {
  try {
    // Basic validation for URL object creation, more specific checks can be added
    new URL(url);
  } catch (_) {
    throw new Error('Invalid URL format. Please ensure it is a complete URL (e.g., https://example.com).');
  }

  const response = await fetch(url, { 
    headers: { 
      'User-Agent': 'EduScraperBot/1.0 (+https://yourdomain.com/bot-info)', // Replace with actual info URL if available
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' 
    },
    redirect: 'follow', // Allow redirects
    timeout: 10000, // 10 seconds timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}. The server may be down or the URL incorrect.`);
  }
  
  const contentType = response.headers.get('content-type');
  // Relaxing content-type check as AI might handle various text-based content.
  // Add stricter checks if AI performs poorly on non-HTML.
  // if (!contentType || (!contentType.includes('text/html') && !contentType.includes('text/plain'))) {
  //   throw new Error('Content is not primarily text-based (e.g., HTML or plain text). Only such pages can be analyzed reliably.');
  // }
  
  return response.text();
}

export async function scrapeAndAnalyzeUrl(url: string): Promise<ScrapeResult> {
  try {
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
        return { success: false, error: 'Invalid URL. Please ensure it starts with http:// or https://' };
    }

    const pageText = await fetchContent(url);

    if (!pageText || pageText.trim().length === 0) {
        return { success: false, error: 'The URL provided returned empty content.' };
    }
    
    // Limit content size to prevent overly long AI processing times / costs
    const MAX_CONTENT_LENGTH = 50000; // Approx 50k characters
    const truncatedContent = pageText.length > MAX_CONTENT_LENGTH ? pageText.substring(0, MAX_CONTENT_LENGTH) + " [Content Truncated]" : pageText;


    const analysis = await analyzeEducationalContent({ content: truncatedContent, url });

    if (!analysis.isEducational) {
      return { success: true, educational: false, reason: analysis.reason || 'The content was determined to be non-educational.' };
    }

    // const summaryResult = await summarizeEducationalContent({ scrapedContent: truncatedContent, url });
    return { success: true, educational: true, summary: truncatedContent };

  } catch (error: any) {
    console.error('Error in scrapeAndAnalyzeUrl for URL:', url, error);
    
    let errorMessage = 'An unexpected error occurred while processing the URL.';
    if (error.message) {
        // More specific error messages for common issues
        if (error.message.includes('Invalid URL format')) {
            errorMessage = error.message;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
            errorMessage = `Could not retrieve content from the URL: ${url}. Please check if the URL is correct and the website is accessible.`;
        } else if (error.message.includes('not primarily text-based')) {
            errorMessage = error.message;
        } else if (error.message.includes('empty content')) {
            errorMessage = error.message;
        } else {
             // For AI related errors or other unexpected issues, keep it generic
            errorMessage = 'An error occurred during content analysis or summarization.'
        }
    }
    return { success: false, error: errorMessage };
  }
}
