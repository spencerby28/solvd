import type { SvelteComponent } from 'svelte';
import { convert } from 'html-to-text';
import { render } from 'svelte/server';

const renderAsPlainText = (markup: string) => {
  return convert(markup, {
    selectors: [
      { selector: "img", format: "skip" },
      { selector: "#__svelte-email-preview", format: "skip" },
    ],
  });
};

export const renderEmail = async (
  component: (...args: any[]) => SvelteComponent,
  props?: Record<string, any>
) => {
  // Ensure arrays are properly handled for each blocks
  const safeProps = props ? JSON.parse(JSON.stringify(props)) : {};
  
  // Create a new context for rendering
  const context = new Map();
  
  // Render the component with context
  const rendered = render(component, {
    props: safeProps,
    context
  });

  // Ensure text content is preserved by converting newlines to <br> tags
  const body = rendered.body.replace(/\n/g, '<br>');

  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

  // Add proper HTML structure with head and body for email clients
  const html = `${doctype}<html><head>${rendered.head}</head><body>${body}</body></html>`;

  const text = renderAsPlainText(rendered.body);

  return {
    html,
    text,
  };
};