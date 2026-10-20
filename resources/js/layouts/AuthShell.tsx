import type { ReactNode } from 'react';

export function AuthShell({ title, wide = false, children }: { title: string; wide?: boolean; children: ReactNode }) {
    return (
        <div className="flex min-h-screen overflow-hidden bg-white text-ink">
            <main className="flex flex-1 flex-col px-6 py-10 md:py-14 md:pl-[120px] min-[1400px]:flex-[0_0_640px] min-[1400px]:pr-0">
                <div className={`my-auto flex flex-col py-10 ${wide ? 'max-w-[480px]' : 'max-w-[400px]'}`}>
                    <h1 className="m-0 text-5xl leading-none font-extrabold tracking-[-0.035em] text-navy md:text-7xl">
                        {title}
                    </h1>
                    {children}
                </div>
            </main>

            <aside
                aria-hidden="true"
                className="hidden flex-1 min-[1400px]:block"
                style={{ background: 'var(--fade-strong), var(--gradient-card-0)' }}
            />
        </div>
    );
}
