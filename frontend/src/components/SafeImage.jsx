import { useState } from "react";
import { ImageOff } from "lucide-react";

// Renders an image; if it fails to load, shows a neutral placeholder of the same size
// so the layout never breaks. Remounts (via `key`) reset the failed state for new URLs.
function SafeImage({ src, alt, className = "", ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-violet-100 to-rose-100 text-violet-400 ${className}`}
      >
        <ImageOff size={32} aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
}

export default SafeImage;
