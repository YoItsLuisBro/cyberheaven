export function enforceCanonicalHost() {
  const canonical = (
    import.meta.env.VITE_CANONICAL_HOST as string | undefined
  )?.trim();
  if (!canonical) return;

  const { host, protocol, pathname, search, hash } = window.location;
  if (host === canonical) return;

  // don’t touch localhost/dev
  if (host.includes("localhost") || host.includes("127.0.0.1")) return;

  window.location.replace(
    `${protocol}//${canonical}${pathname}${search}${hash}`,
  );
}
