import { feeBreakdownOf } from '../../listings.fee';
import styles from './ListingFeeSummary.module.css';

const EMPTY_AMOUNT = 'R$ 0,00';

export function ListingFeeSummary({ price }: { price: string }) {
  const fee = feeBreakdownOf(price);

  return (
    <dl className={styles.summary} aria-live="polite">
      <div className={styles.fee}>
        <dt>Taxa (5%):</dt>
        <dd className={styles.feeAmount}>- {fee?.platformFee ?? EMPTY_AMOUNT}</dd>
      </div>
      <div className={styles.net}>
        <dt>Você recebe líquido:</dt>
        <dd className={styles.netAmount}>{fee?.netAmount ?? EMPTY_AMOUNT}</dd>
      </div>
    </dl>
  );
}
