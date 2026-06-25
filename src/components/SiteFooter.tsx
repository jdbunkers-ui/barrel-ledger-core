export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 px-6 py-6 text-center text-xs text-stone-500">
      <p>Designed and Managed by White Blaze Analytics LLC</p>

      <p className="mt-1">
        <a
          href="https://www.whiteblazeanalytics.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-stone-700 hover:underline"
        >
          www.whiteblazeanalytics.com
        </a>
      </p>
    </footer>
  );
}