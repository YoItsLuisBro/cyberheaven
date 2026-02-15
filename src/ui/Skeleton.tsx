export function Skeleton({ h = 14, w = "100%" }: { h?: number; w?: number | string }) {
  return <div className="skel" style={{ height: h, width: w }} />;
}
