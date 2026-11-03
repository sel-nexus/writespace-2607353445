import PropTypes from 'prop-types';

const styles = {
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
  pink: 'border-pink-200 bg-pink-50 text-pink-800',
  teal: 'border-teal-200 bg-teal-50 text-teal-800',
};

/**
 * Display a single admin overview statistic.
 * @param {Object} props Statistic label, value, and accent variant.
 * @returns {JSX.Element} Statistic card.
 */
export default function StatCard({ label, value, tone }) {
  return (
    <article className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-3 text-4xl font-extrabold tabular-nums" aria-label={`${label}: ${value}`}>{value}</p>
    </article>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.oneOf(Object.keys(styles)).isRequired,
};
