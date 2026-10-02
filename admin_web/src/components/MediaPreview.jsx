import React from 'react';

const videoFile = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;
const imageFile = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
export default function MediaPreview({src,alt='',className='',style,mediaType='auto'}) {
  if (!src) return null;
  const value=String(src).trim();
  let provider='',id='';
  try {
    const url=new URL(value,window.location.origin),host=url.hostname.toLowerCase();
    if(host==='youtu.be'){provider='youtube';id=url.pathname.split('/').filter(Boolean)[0]||'';}
    else if(host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtube-nocookie.com'||host.endsWith('.youtube-nocookie.com')){provider='youtube';id=url.searchParams.get('v')||url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]||'';}
    else if(host==='vimeo.com'||host.endsWith('.vimeo.com')){provider='vimeo';id=url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1]||'';}
  } catch (_) {}
  const video=Boolean(provider&&id)||videoFile.test(value)||/\/video\/upload\//i.test(value)||(!imageFile.test(value)&&mediaType==='video');
  if(provider&&id){const embed=provider==='vimeo'?`https://player.vimeo.com/video/${id}`:`https://www.youtube-nocookie.com/embed/${id}`;return <iframe className={className} src={embed} title={alt||'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={style}/>}
  return video ? <video className={className} src={src} title={alt} controls playsInline preload="metadata" style={style}/> : <img className={className} src={src} alt={alt} style={style}/>;
}
