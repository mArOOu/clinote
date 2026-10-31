export function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ width: "40%", height: "2.2rem" }} />
      <div className="skeleton" style={{ width: "25%", height: "0.9rem", marginTop: "0.8rem" }} />
      <div className="skeleton" style={{ width: "100%", height: "5rem", marginTop: "2rem" }} />
      <div className="skeleton" style={{ width: "100%", height: "5rem", marginTop: "0.8rem" }} />
    </div>
  );
}