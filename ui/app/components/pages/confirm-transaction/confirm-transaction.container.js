import { connect } from 'react-redux'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import {
  setTransactionToConfirm,
  clearConfirmTransaction,
} from '../../../ducks/confirm-transaction.duck'
import {
  fetchBasicGasAndTimeEstimates,
} from '../../../ducks/gas.duck'
import ConfirmTransaction from './confirm-transaction.component'
import { getTotalUnapprovedCount } from '../../../selectors'
import { unconfirmedTransactionsListSelector } from '../../../selectors/confirm-transaction'

const mapStateToProps = state => {
  const { dekusan: { send }, confirmTransaction } = state

  return {
    totalUnapprovedCount: getTotalUnapprovedCount(state),
    send,
    confirmTransaction,
    unconfirmedTransactions: unconfirmedTransactionsListSelector(state),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setTransactionToConfirm: transactionId => dispatch(setTransactionToConfirm(transactionId)),
    clearConfirmTransaction: () => dispatch(clearConfirmTransaction()),
    fetchBasicGasAndTimeEstimates: () => dispatch(fetchBasicGasAndTimeEstimates()),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ConfirmTransaction)
