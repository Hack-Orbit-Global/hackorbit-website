'use client'

/**
 * Lightweight Client QR Code Component
 * Renders pre-generated SVG QR string from server
 * Zero client-side computation, zero extra deps
 */
export default function QRCode({ svgString, size = 160, id }) {
  if (!svgString) return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-white rounded-lg"
      aria-label="QR code unavailable"
    >
      <span className="text-gray-400 text-xs">QR</span>
    </div>
  )

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgString }}
      aria-label={`QR code for Hack Orbit profile ${id}`}
      role="img"
      style={{ width: size, height: size, lineHeight: 0 }}
      className="rounded-lg overflow-hidden"
    />
  )
}
