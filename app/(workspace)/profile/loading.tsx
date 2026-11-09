export default function ProfileLoading() {
  return (
    <div className="profile" aria-busy="true">
      <p className="visually-hidden">Loading profile…</p>
      <div className="profile-summary profile-skeleton" aria-hidden="true">
        <span className="profile-skeleton-avatar" />
        <div className="profile-skeleton-lines">
          <span className="profile-skeleton-block profile-skeleton-title" />
          <span className="profile-skeleton-block profile-skeleton-line" />
          <span className="profile-skeleton-block profile-skeleton-line profile-skeleton-short" />
        </div>
      </div>
      <div className="profile-card profile-skeleton" aria-hidden="true">
        <span className="profile-skeleton-block profile-skeleton-title" />
        <div className="profile-skeleton-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <span className="profile-skeleton-block profile-skeleton-field" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
