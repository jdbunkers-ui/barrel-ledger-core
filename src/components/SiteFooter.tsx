export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 px-6 py-6 text-center text-sm text-stone-500">
      <p>Designed and managed by White Blaze Analytics LLC</p>

      <p className="mt-2">
        Interested in a Barrel Ledger of your own?
      </p>

      <p className="mt-2">
        <a
          href="https://www.whiteblazeanalytics.com/barrel-ledger/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-semibold text-stone-700 hover:text-stone-950 hover:underline"
        >
          Explore Barrel Ledger
        </a>
      </p>
    </footer>
  );
}