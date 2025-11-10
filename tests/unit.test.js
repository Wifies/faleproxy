const cheerio = require('cheerio');

/**
 * Unit tests for Yale to Fale replacement logic
 */

// Helper function that mimics the app's replacement logic
function replaceYaleWithFale(html) {
  const $ = cheerio.load(html);
  
  // Process text nodes in the body
  $('body *').contents().filter(function() {
    return this.nodeType === 3; // Text nodes only
  }).each(function() {
    // Replace text content but not in URLs or attributes
    const text = $(this).text();
    const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
    if (text !== newText) {
      $(this).replaceWith(newText);
    }
  });
  
  // Process title separately
  const title = $('title').text().replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
  $('title').text(title);
  
  return $.html();
}

describe('Yale to Fale replacement logic', () => {
  test('should replace Yale in title', () => {
    const html = `
      <html>
        <head>
          <title>Yale University</title>
        </head>
        <body>
          <h1>Test</h1>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    expect(modifiedHtml).toContain('<title>Fale University</title>');
  });

  test('should replace Yale in body text', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <p>Yale University is great.</p>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    expect(modifiedHtml).toContain('Fale University is great.');
    expect(modifiedHtml).not.toContain('Yale University');
  });

  test('should not replace Yale in URLs', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <a href="https://www.yale.edu">Visit Yale</a>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    // URL should remain unchanged
    expect(modifiedHtml).toContain('https://www.yale.edu');
    // But link text should be changed
    expect(modifiedHtml).toContain('Visit Fale');
  });

  test('should handle text that has no Yale references', () => {
    const html = `
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Hello World</h1>
          <p>This is a test page with no references.</p>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    expect(modifiedHtml).toContain('<title>Test Page</title>');
    expect(modifiedHtml).toContain('<h1>Hello World</h1>');
    expect(modifiedHtml).toContain('<p>This is a test page with no references.</p>');
  });

  test('should handle case-insensitive replacements', () => {
    const html = `
      <html>
        <head></head>
        <body>
          <p>YALE University, Yale College, and yale medical school are all part of the same institution.</p>
        </body>
      </html>
    `;
    
    const $ = cheerio.load(html);
    
    // Process text nodes
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const modifiedHtml = $.html();

    expect(modifiedHtml).toContain('FALE University, Fale College, and fale medical school');
  });
});

describe('Edge cases', () => {
  test('should handle multiple Yale occurrences in same paragraph', () => {
    const html = `
      <html>
        <body>
          <p>Yale was founded in 1701. Yale is in Connecticut. Go Yale!</p>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    expect(modifiedHtml).toContain('Fale was founded');
    expect(modifiedHtml).toContain('Fale is in Connecticut');
    expect(modifiedHtml).toContain('Go Fale!');
    expect(modifiedHtml).not.toContain('Yale');
  });

  test('should preserve HTML structure', () => {
    const html = `
      <html>
        <body>
          <div class="yale-section">
            <h2>About Yale</h2>
            <p>Yale University description</p>
          </div>
        </body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    // Class name should remain (it's an attribute, not text)
    expect(modifiedHtml).toContain('class="yale-section"');
    // But text should be changed
    expect(modifiedHtml).toContain('About Fale');
    expect(modifiedHtml).toContain('Fale University description');
  });

  test('should handle empty body', () => {
    const html = `
      <html>
        <head>
          <title>Empty Page</title>
        </head>
        <body></body>
      </html>
    `;
    
    const modifiedHtml = replaceYaleWithFale(html);
    expect(modifiedHtml).toContain('<title>Empty Page</title>');
    expect(modifiedHtml).toContain('<body></body>');
  });
});