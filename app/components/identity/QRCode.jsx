'use client'

/**
 * QRCode — renders pre-generated server SVG string.
 * Forces the SVG to fill the container via CSS (the raw SVG has
 * hardcoded width/height baked in from the generator, so we override
 * them with CSS so the size prop is actually respected).
 */
export default function QRCode({ svgString, size = 140, id }) {
  const fallback = (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-white rounded-lg"
      aria-label="QR code unavailable"
    >
      <span className="text-gray-400 text-xs font-mono">QR</span>
    </div>
  )

  if (!svgString) return fallback

  return (
    <div
      aria-label={`QR code for Hack Orbit profile ${id}`}
      role="img"
      style={{ width: size, height: size, lineHeight: 0, flexShrink: 0 }}
      className="rounded-lg overflow-hidden [&_svg]:!w-full [&_svg]:!h-full [&_svg]:block"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}
