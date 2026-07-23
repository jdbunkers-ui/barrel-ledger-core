export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 px-6 py-8 text-center text-2xl text-stone-600">
      <p className="font-medium">
        Designed and Managed by White Blaze Analytics LLC
      </p>

      <p className="mx-auto mt-3 max-w-3xl leading-relaxed">
        Inspired by this Barrel Ledger? Explore how you can lease a customized
        Barrel Ledger for your own reviews, tasting notes, and whiskey
        community.
      </p>

      <p className="mt-3">
        <a
          href="https://www.whiteblazeanalytics.com/barrel-ledger/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-stone-700 hover:text-stone-950 hover:underline"
        >
          Explore Barrel Ledger
        </a>
      </p>
    </footer>
  );
}