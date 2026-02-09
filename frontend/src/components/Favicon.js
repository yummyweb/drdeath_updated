import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';

const Favicon = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Use professional image as favicon if available
    if (settings.professional_image_url) {
      const imageUrl = getImageUrl(settings.professional_image_url);
      
      // Remove existing favicon links (but keep manifest)
      const existingLinks = document.querySelectorAll('link[rel*="icon"]:not([rel="manifest"])');
      existingLinks.forEach(link => link.remove());

      // Create main favicon link - use larger size so the full photo is visible
      const mainLink = document.createElement('link');
      mainLink.rel = 'icon';
      mainLink.type = imageUrl.startsWith('data:image/') 
        ? imageUrl.split(';')[0].split(':')[1] 
        : 'image/png';
      mainLink.href = imageUrl;
      mainLink.sizes = '512x512';
      document.head.appendChild(mainLink);

      // Add for Apple devices
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = imageUrl;
      appleLink.sizes = '180x180';
      document.head.appendChild(appleLink);

      // Add multiple sizes for better browser compatibility
      // Using larger sizes so the complete photo fits and is visible
      const sizes = [192, 256, 512];
      sizes.forEach(size => {
        const sizeLink = document.createElement('link');
        sizeLink.rel = 'icon';
        sizeLink.type = imageUrl.startsWith('data:image/') 
          ? imageUrl.split(';')[0].split(':')[1] 
          : 'image/png';
        sizeLink.href = imageUrl;
        sizeLink.sizes = `${size}x${size}`;
        document.head.appendChild(sizeLink);
      });
    }
  }, [settings.professional_image_url]);

  return null;
};

export default Favicon;

