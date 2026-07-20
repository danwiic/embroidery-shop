"use client";

import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/lib/hooks/use-api";

type LogoProps = {
  href: string;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
};

export const SiteLogo = ({ href, className = "", textClassName = "", imageClassName = "" }: LogoProps) => {
  const { data: settings } = useSettings();

  const name = settings?.shopName || "JENDAVE";
  const logoUrl = settings?.logoUrl;

  return (
    <Link href={href} className={className || "text-lg font-bold text-navy tracking-wide"}>
      {logoUrl ? (
        <div className={`relative ${imageClassName || "w-8 h-8"}`}>
          <Image src={logoUrl} alt={name} fill sizes="32px" className="object-contain" />
        </div>
      ) : (
        <span className={textClassName || ""}>{name}</span>
      )}
    </Link>
  );
};
