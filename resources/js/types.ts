export type Flash = {
    success: string | null;
    error: string | null;
};

// Props shared by HandleInertiaRequests; auth is only present when logged in
export type SharedProps = {
    auth: { user: { name: string; email: string } };
    flash: Flash;
};

export type LinkRow = {
    code: string;
    url: string;
    destination: string;
    createdAt: string | null;
    clicks: number;
    lastClickedAt: string | null;
};

export type CreatedLink = { url: string; destination: string };
