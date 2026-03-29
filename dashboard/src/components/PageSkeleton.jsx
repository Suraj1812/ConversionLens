import Spinner from './Spinner.jsx';

export default function PageSkeleton() {
  return (
    <div className="page-spinner-state" aria-hidden="true">
      <div className="panel state-block">
        <Spinner label="Loading analytics" />
      </div>
    </div>
  );
}
