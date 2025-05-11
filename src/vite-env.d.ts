
/// <reference types="vite/client" />

declare module '*.json' {
  const value: any;
  export default value;
}

// Add Stripe pricing table element type declaration
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-pricing-table': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id'?: string;
        'publishable-key'?: string;
      },
      HTMLElement
    >;
  }
}
