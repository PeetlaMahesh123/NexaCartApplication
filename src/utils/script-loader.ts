// Utility to load external scripts with enhanced error handling
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous'; // Handle CORS issues
    
    script.onload = () => {
      console.log(`✅ Script loaded successfully: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.warn(`⚠️ Failed to load script: ${src}`, error);
      // Don't reject immediately, let the caller handle the fallback
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn(`⏰ Script load timeout: ${src}`);
      script.remove();
      reject(new Error(`Script load timeout: ${src}`));
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log(`✅ Script loaded successfully: ${src}`);
      resolve();
    };
    
    document.head.appendChild(script);
  });
}

// Enhanced script loader with multiple fallback URLs
export function loadScriptWithFallback(urls: string[]): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error | null = null;
    
    for (const url of urls) {
      try {
        await loadScript(url);
        resolve();
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Trying next URL for ${urls[0]}...`);
        continue;
      }
    }
    
    reject(lastError || new Error('All script URLs failed'));
  });
}
