"use client";

import { useEffect } from "react";

/**
 * Dynamically sets the browser favicon from the company logo URL.
 * Falls back to generating an initial-letter favicon when logo is unavailable.
 */
export function useDynamicFavicon(
  logoUrl: string | null,
  companyName: string,
  primaryColor: string
): void {
  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const dataUrl = drawImageFavicon(img);
        setFavicon(dataUrl);
      };
      img.onerror = () => {
        const dataUrl = drawTextFavicon(companyName, primaryColor);
        setFavicon(dataUrl);
      };
      img.src = logoUrl;
    } else {
      const dataUrl = drawTextFavicon(companyName, primaryColor);
      setFavicon(dataUrl);
    }
  }, [logoUrl, companyName, primaryColor]);
}

/** Draw the logo image onto a 32x32 canvas with contain-fit (centered). */
function drawImageFavicon(img: HTMLImageElement): string {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const ratio = Math.min(size / img.width, size / img.height);
  const drawWidth = img.width * ratio;
  const drawHeight = img.height * ratio;
  const offsetX = (size - drawWidth) / 2;
  const offsetY = (size - drawHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  return canvas.toDataURL("image/png");
}

/** Generate a favicon with the company's first letter on a colored background. */
function drawTextFavicon(companyName: string, primaryColor: string): string {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Rounded rectangle background
  const radius = 6;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = primaryColor;
  ctx.fill();

  // Letter
  const initial = (companyName.trim()[0] ?? "?").toUpperCase();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, size / 2, size / 2 + 1);

  return canvas.toDataURL("image/png");
}

/** Insert or update the favicon <link> element in <head>. */
function setFavicon(dataUrl: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}
