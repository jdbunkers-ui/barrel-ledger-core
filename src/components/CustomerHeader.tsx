type CustomerHeaderProps = {
  siteTitle: string;
  siteSubtitle: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
};

export default function CustomerHeader({
  siteTitle,
  siteSubtitle,
  logoUrl,
  bannerUrl,
  primaryColor,
}: CustomerHeaderProps) {
  return (
    <section
      className="relative text-white py-20 bg-cover bg-center"
      style={{
        backgroundColor: primaryColor,
        backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative max-w-6xl mx-auto px-6 flex items-center gap-6">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${siteTitle} logo`}
            className="h-24 w-24 rounded-full bg-white object-contain p-2 shadow"
          />
        )}

        <div>
          <h1 className="text-5xl font-bold">{siteTitle}</h1>

          {siteSubtitle && (
            <p className="mt-4 text-xl text-white/90">{siteSubtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}