import { t } from '../i18n';
import { Icon } from '../ui';
import { Logo } from './Logo';

const MAIN_SITE = 'https://rickklaasboer.nl';

// Mirrors rickklaasboer-astro Hero (pageTitle, long title) with Header (cta)
export function SiteHero() {
    return (
        <section
            className="overflow-hidden px-2 pt-3 pb-10 text-white md:box-border md:px-4 md:pt-7 md:pb-0"
            style={{ background: 'var(--fade-soft), var(--gradient-card-0)' }}
        >
            <header className="mx-auto box-border flex h-14 max-w-[1248px] items-center justify-between px-3 md:h-[60px] md:px-0">
                <a
                    href={MAIN_SITE}
                    aria-label="Rick Klaasboer, rickklaasboer.nl"
                    className="on-dark anim-zoom inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-(image:--gradient-accent-icon) text-white no-underline hover:text-white"
                >
                    <Logo />
                </a>
                <a
                    href={MAIN_SITE}
                    className="group anim-press on-dark inline-flex h-11 items-center gap-2 rounded-button bg-(image:--gradient-accent) px-4 text-[15px] font-bold text-white no-underline hover:text-white md:px-5"
                >
                    rickklaasboer.nl
                    <Icon name="arrow-up-right" size={14} />
                </a>
            </header>
            <div className="px-3 pt-[72px] md:mx-auto md:max-w-[1200px] md:px-0 md:pt-[152px] md:pb-[72px]">
                <h1 className="m-0 text-[40px] leading-none font-extrabold tracking-[-0.035em] md:text-[136px] md:leading-[0.95]">rckklsbr.nl</h1>
                <p className="m-0 mt-3.5 text-[17px] leading-normal md:mt-6 md:max-w-[640px] md:text-xl">{t('Paste a long link, get a short one back. No account needed.')}</p>
            </div>
        </section>
    );
}
