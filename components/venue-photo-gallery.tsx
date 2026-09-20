"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { VenueCover } from "@/components/venue-cover";

type GalleryProps = { images: string[]; venueName: string; accent: string };

function Lightbox({ images, venueName, index, onIndexChange, onClose }: { images: string[]; venueName: string; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const touchStart = useRef<number | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const previous = useCallback(() => onIndexChange((index - 1 + images.length) % images.length), [images.length, index, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % images.length), [images.length, index, onIndexChange]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key === "ArrowLeft" && images.length > 1) previous(); if (event.key === "ArrowRight" && images.length > 1) next(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [images.length, next, onClose, previous]);

  return <div className="venue-lightbox" role="dialog" aria-modal="true" aria-label={`${venueName} 사진 크게 보기`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <button className="venue-lightbox-close" onClick={onClose} aria-label="사진 크게 보기 닫기"><X /></button>
    <div className="venue-lightbox-stage" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touchStart.current === null || images.length < 2) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(delta) > 50) { if (delta > 0) previous(); else next(); } touchStart.current = null; }}>
      {failedUrl === images[index] ? <div className="venue-photo-error"><ImageOff /><span>이미지를 불러오지 못했습니다.</span></div> : <img src={images[index]} alt={`${venueName} 공연장 사진 ${index + 1}`} onError={() => setFailedUrl(images[index])} />}
      {images.length > 1 && <><button className="venue-lightbox-arrow previous" onClick={previous} aria-label="이전 사진"><ChevronLeft /></button><button className="venue-lightbox-arrow next" onClick={next} aria-label="다음 사진"><ChevronRight /></button><span className="venue-lightbox-count">{index + 1} / {images.length}</span></>}
    </div>
  </div>;
}

export function VenueHeroGallery({ images, venueName, accent }: GalleryProps) {
  const [index, setIndex] = useState(0); const [failedImages, setFailedImages] = useState<Set<number>>(new Set()); const [lightboxOpen, setLightboxOpen] = useState(false); const touchStart = useRef<number | null>(null);
  const previous = () => setIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setIndex((current) => (current + 1) % images.length);
  if (!images.length) return <div className="venue-gallery-fallback"><VenueCover name={venueName} accent={accent} /></div>;
  const failed = failedImages.has(index);
  return <div className="venue-gallery" tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowLeft" && images.length > 1) previous(); if (event.key === "ArrowRight" && images.length > 1) next(); }}>
    <div className="venue-gallery-stage" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touchStart.current === null || images.length < 2) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(delta) > 50) { if (delta > 0) previous(); else next(); } touchStart.current = null; }}>
      <button className="venue-gallery-main" onClick={() => !failed && setLightboxOpen(true)} aria-label={`${venueName} 사진 ${index + 1} 크게 보기`}>
        {failed ? <div className="venue-photo-error"><ImageOff /><span>이미지를 불러오지 못했습니다.</span></div> : <img src={images[index]} alt={`${venueName} 공연장 대표 사진 ${index + 1}`} onError={() => setFailedImages((current) => new Set(current).add(index))} />}
      </button>
      {images.length > 1 && <><button className="venue-gallery-arrow previous" onClick={previous} aria-label="이전 사진"><ChevronLeft /></button><button className="venue-gallery-arrow next" onClick={next} aria-label="다음 사진"><ChevronRight /></button><span className="venue-gallery-count">{index + 1} / {images.length}</span></>}
    </div>
    {images.length > 1 && <div className="venue-gallery-thumbnails" aria-label="공연장 사진 선택">{images.map((image, imageIndex) => <button key={`${image}-${imageIndex}`} className={imageIndex === index ? "active" : ""} onClick={() => setIndex(imageIndex)} aria-label={`${imageIndex + 1}번 사진 보기`} aria-current={imageIndex === index ? "true" : undefined}><img src={image} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /></button>)}</div>}
    {lightboxOpen && <Lightbox images={images} venueName={venueName} index={index} onIndexChange={setIndex} onClose={() => setLightboxOpen(false)} />}
  </div>;
}

export function VenuePhotoSection({ images, venueName }: Omit<GalleryProps, "accent">) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null); const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  if (!images.length) return null;
  return <section className="venue-photo-section"><h2>공연장 사진</h2><div className="venue-photo-list">{images.map((image, index) => <button key={`${image}-${index}`} onClick={() => !failedImages.has(index) && setLightboxIndex(index)} aria-label={`${venueName} 사진 ${index + 1} 크게 보기`}>{failedImages.has(index) ? <div className="venue-photo-error editorial"><ImageOff /><span>이미지를 불러오지 못했습니다.</span></div> : <img src={image} alt={`${venueName} 공연장 사진 ${index + 1}`} loading="lazy" onError={() => setFailedImages((current) => new Set(current).add(index))} />}</button>)}</div>{lightboxIndex !== null && <Lightbox images={images} venueName={venueName} index={lightboxIndex} onIndexChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} />}</section>;
}
