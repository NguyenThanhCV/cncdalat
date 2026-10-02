import { useEffect, useState } from "react";
import * as api from "../api/shop";

let mediaPromise;
let mediaCache = {};
const loadMedia = () => {
  if (!mediaPromise) mediaPromise = api.getSiteMedia().then((result) => {
    const rows = result?.data?.data ?? result?.data ?? result;
    mediaCache = Object.fromEntries((Array.isArray(rows) ? rows : []).map((row) => [row.key, row]));
    return mediaCache;
  }).catch(() => ({}));
  return mediaPromise;
};

export default function useSiteMedia(key) {
  const [asset, setAsset] = useState(() => mediaCache[key] || null);
  useEffect(() => {
    let active = true;
    loadMedia().then((rows) => { if (active) setAsset(rows[key] || null); });
    return () => { active = false; };
  }, [key]);
  return asset;
}
