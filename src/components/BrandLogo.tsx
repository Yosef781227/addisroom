import Image from "next/image";
/** Clip the supplied navbar artwork to the logo only, preserving its original pixels. */
export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`brand-logo ${footer ? "brand-logo-footer" : ""}`}>
      <Image
        src="/images/brand/addis-rooms-source.png"
        alt="Addis Rooms"
        width={2164}
        height={727}
        unoptimized
        className="brand-logo-source"
      />
    </span>
  );
}
