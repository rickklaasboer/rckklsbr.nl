const MAIN_SITE = 'https://rickklaasboer.nl';
const SITE_NAME = 'rckklsbr.nl';

// Mirrors rickklaasboer-astro Footer (site)
export function SiteFooter() {
    return (
        <footer className="on-dark bg-navy text-sky">
            <div className="px-6 pt-8 pb-6 text-[13px] md:mx-auto md:flex md:max-w-[1200px] md:items-center md:justify-between md:gap-6 md:px-0 md:py-10 md:text-sm">
                <div className="font-mono text-[15px] text-white">{SITE_NAME}</div>
                <div className="md:flex md:items-center md:gap-6">
                    <div className="mt-3 md:mt-0">
                        <a href={MAIN_SITE} className="anim-fade font-normal text-white no-underline hover:text-pink">
                            rickklaasboer.nl
                        </a>
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-[18px] md:mt-0 md:border-0 md:pt-0">
                        © {new Date().getFullYear()} {SITE_NAME}
                    </div>
                </div>
            </div>
        </footer>
    );
}
