"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type LogoProps = {
  href: string;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
};

type Settings = {
  shopName?: string;
  logoUrl?: string;
};

export const SiteLogo = ({ href, className = "", textClassName = "", imageClassName = "" }: LogoProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

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
