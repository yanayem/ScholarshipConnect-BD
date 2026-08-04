import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * This file is web-only and used to configure the root HTML for every page in the app.
 * It's similar to `_document.js` in Next.js.
 */
export default function HTML({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work as expected.
          See: https://docs.expo.dev/router/appearance/#root-html
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements here (like fonts, meta tags, etc.) */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            height: 100%;
            overflow: auto;
            background-color: #F8F2E7; /* Match theme.colors.background */
          }
          /* Improve fonts on web */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
