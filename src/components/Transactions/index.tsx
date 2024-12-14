import { useCallback } from "react"
import { useCustomFetch} from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading, clearCacheByEndpoint} = useCustomFetch()

  // BUG 7: After successfully setting transaction approval, we clear related caches.
  // BUG 7: This ensures next fetches from paginated/filtered endpoints return updated data.

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // BUG 7: Clear caches so that subsequent requests get fresh data.
      // BUG 7: We know paginatedTransactions and transactionsByEmployee can become stale.
      clearCacheByEndpoint(["paginatedTransactions", "transactionsByEmployee"])
    },
    [fetchWithoutCache, clearCacheByEndpoint]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
