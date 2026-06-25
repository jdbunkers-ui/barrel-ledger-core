"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  FaEnvelope,
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaRedditAlien,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";

type AboutProfile = {
  organization_id: string | null;
  organization_slug: string | null;
  organization_name: string | null;

  display_name: string | null;
  tagline: string | null;
  bio: string | null;
  review_philosophy: string | null;

  profile_image_url: string | null;
  banner_image_url: string | null;

  email_address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  reddit_url: string | null;
  x_url: string | null;
  website_url: string | null;
};

type AboutClientProps = {
  organizationSlug: string;
};

type ContactLink = {
  label: string;
  value: string;
  href: string;
  Icon: IconType;
  iconClassName: string;
};

export default function AboutClient({ organizationSlug }: AboutClientProps) {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAboutProfile() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .schema("barrel_ledger_public")
        .from("v_about")
        .select(
          `
          organization_id,
          organization_slug,
          organization_name,
          display_name,
          tagline,
          bio,
          review_philosophy,
          profile_image_url,
          banner_image_url,
          email_address,
          instagram_url,
          facebook_url,
          youtube_url,
          tiktok_url,
          reddit_url,
          x_url,
          website_url
        `
        )
        .eq("organization_slug", organizationSlug)
        .limit(1);

      if (error) {
        setErrorMessage(error.message);
        setProfile(null);
      } else {
        setProfile((data?.[0] ?? null) as AboutProfile | null);
      }

      setLoading(false);
    }

    loadAboutProfile();
  }, [organizationSlug]);

  const contactLinks = useMemo<ContactLink[]>(() => {
    if (!profile) return [];

    const links: ContactLink[] = [];

    if (profile.email_address) {
      links.push({
        label: "Email",
        value: profile.email_address,
        href: `mailto:${profile.email_address}`,
        Icon: FaEnvelope,
        iconClassName: "bg-amber-800 text-white",
      });
    }

    if (profile.instagram_url) {
      links.push({
        label: "Instagram",
        value: cleanUrlLabel(profile.instagram_url),
        href: profile.instagram_url,
        Icon: FaInstagram,
        iconClassName:
          "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white",
      });
    }

    if (profile.facebook_url) {
      links.push({
        label: "Facebook",
        value: cleanUrlLabel(profile.facebook_url),
        href: profile.facebook_url,
        Icon: FaFacebookF,
        iconClassName: "bg-blue-600 text-white",
      });
    }

    if (profile.youtube_url) {
      links.push({
        label: "YouTube",
        value: cleanUrlLabel(profile.youtube_url),
        href: profile.youtube_url,
        Icon: FaYoutube,
        iconClassName: "bg-red-600 text-white",
      });
    }

    if (profile.tiktok_url) {
      links.push({
        label: "TikTok",
        value: cleanUrlLabel(profile.tiktok_url),
        href: profile.tiktok_url,
        Icon: FaTiktok,
        iconClassName: "bg-black text-white",
      });
    }

    if (profile.reddit_url) {
      links.push({
        label: "Reddit",
        value: cleanUrlLabel(profile.reddit_url),
        href: profile.reddit_url,
        Icon: FaRedditAlien,
        iconClassName: "bg-orange-600 text-white",
      });
    }

    if (profile.x_url) {
      links.push({
        label: "Twitter / X",
        value: cleanUrlLabel(profile.x_url),
        href: profile.x_url,
        Icon: FaXTwitter,
        iconClassName: "bg-black text-white",
      });
    }

    if (profile.website_url) {
      links.push({
        label: "Website",
        value: cleanUrlLabel(profile.website_url),
        href: profile.website_url,
        Icon: FaGlobe,
        iconClassName: "bg-stone-700 text-white",
      });
    }

    return links;
  }, [profile]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700 shadow-sm">
          Loading about profile...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-8 text-center text-stone-700 shadow-sm">
          About information has not been added yet.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm md:p-8">
        {profile.profile_image_url ? (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
            <img
              src={profile.profile_image_url}
              alt={profile.display_name ?? "Profile image"}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-stone-950 md:text-4xl">
              {profile.display_name ?? profile.organization_name ?? "About"}
            </h1>

            {profile.tagline && (
              <p className="mt-2 text-lg text-stone-700">{profile.tagline}</p>
            )}
          </div>
        )}
      </div>

      {(profile.bio || profile.review_philosophy) && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {profile.bio && (
            <article className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-950">About</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-stone-700">
                {profile.bio}
              </p>
            </article>
          )}

          {profile.review_philosophy && (
            <article className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-950">
                Review Philosophy
              </h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-stone-700">
                {profile.review_philosophy}
              </p>
            </article>
          )}
        </div>
      )}

      <article className="mt-6 rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-stone-950">Get in Touch</h2>

        {contactLinks.length === 0 ? (
          <p className="mt-3 text-stone-600">
            Contact links have not been added yet.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactLinks.map((link) => {
              const Icon = link.Icon;

              return (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  target={
                    link.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:border-stone-400 hover:bg-white"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md ${link.iconClassName}`}
                  >
                    <Icon size={24} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-stone-500">
                      {link.label}
                    </span>
                    <span className="block truncate text-sm font-semibold text-amber-800 group-hover:underline">
                      {link.value}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

function cleanUrlLabel(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/i, "");
}