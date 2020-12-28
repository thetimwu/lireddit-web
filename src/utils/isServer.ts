// if window then client rendering otherwise ssr
export const isServer = () => typeof window === "undefined";
