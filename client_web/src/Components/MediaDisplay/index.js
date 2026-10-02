import React from "react";
import "./style.css";

const VIDEO_FILE = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;
const IMAGE_FILE = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;

function getVideoSource(src) {
  const value = String(src || "").trim();
  if (!value) return null;
  if (VIDEO_FILE.test(value) || /\/video\/upload\//i.test(value)) return { kind: "file", src: value };

  try {
    const url = new URL(value, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) {
      const id = host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
      if (id) return { kind: "embed", provider: "youtube", id, src: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1];
      if (id) return { kind: "embed", provider: "vimeo", id, src: `https://player.vimeo.com/video/${id}` };
    }
  } catch (_) {
    return null;
  }
  return null;
}

export default function MediaDisplay({ src, alt = "", className = "", poster = "", mediaType = "auto", onError, ...props }) {
  if (!src) return null;
  const safeProps = Object.fromEntries(Object.entries(props).filter(([key]) => !["controls", "autoPlay", "muted", "loop", "playsInline", "disablePictureInPicture"].includes(key)));
  const video = getVideoSource(src) || (mediaType === "video" && !IMAGE_FILE.test(String(src)) ? { kind: "file", src } : null);

  if (video?.kind === "embed") {
    const params = new URLSearchParams({ autoplay: "1", mute: "1", controls: "0", playsinline: "1", loop: "1" });
    if (video.provider === "youtube") {
      params.set("playlist", video.id);
      params.set("modestbranding", "1");
      params.set("rel", "0");
    }
    if (video.provider === "vimeo") params.set("background", "1");
    return <iframe {...safeProps} className={`media-display media-display-video ${className}`} src={`${video.src}?${params}`} title={alt || "Embedded video"} allow="autoplay; encrypted-media" loading="lazy" onError={onError} />;
  }

  if (video) return <video {...safeProps} className={`media-display media-display-video ${className}`} src={video.src} poster={poster || undefined} aria-label={alt || undefined} controls={false} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture onError={onError} />;
  return <img {...safeProps} className={`media-display ${className}`} src={src} alt={alt} loading="lazy" onError={onError} />;
}
