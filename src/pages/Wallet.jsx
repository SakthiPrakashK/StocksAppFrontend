import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { walletApi } from '../services/api'
import { trackWalletTransaction, trackClick } from '../services/lytics'
import Button from '../components/Button'
import Input from '../components/Input'

const Wallet = () => {
  const { user, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await walletApi.getTransactions()
        const txData = Array.isArray(data.data) ? data.data : []
        setTransactions(txData)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' })
      return
    }

    setProcessing(true)
    setMessage({ type: '', text: '' })

    try {
      const amountValue = parseFloat(amount)
      if (actionType === 'deposit') {
        await walletApi.deposit(amountValue)
        setMessage({ type: 'success', text: `Successfully added ₹${amount} to wallet` })
        // Track deposit with Lytics
        trackWalletTransaction('deposit', amountValue)
      } else {
        await walletApi.withdraw(amountValue)
        setMessage({ type: 'success', text: `Successfully withdrew ₹${amount} from wallet` })
        // Track withdrawal with Lytics
        trackWalletTransaction('withdraw', amountValue)
      }

      // Refresh data
      await refreshUser()
      const txData = await walletApi.getTransactions()
      setTransactions(txData.data || [])
      setAmount('')
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to ${actionType}` 
      })
    } finally {
      setProcessing(false)
    }
  }

  const quickAmounts = [500, 1000, 5000, 10000, 25000, 50000]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Wallet
          </h1>
          <p className="text-dark-muted">
            Manage your funds
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Balance & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-sm text-dark-muted mb-2">Available Balance</p>
              <p className="text-4xl font-display font-bold text-white mb-1">
                ₹{user?.wallet?.balance?.toLocaleString('en-IN') || '0'}
              </p>
              <p className="text-sm text-dark-muted">{user?.wallet?.currency || 'INR'}</p>
            </div>

            {/* Action Card */}
            <div className="glass-card rounded-2xl p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setActionType('deposit')
                    trackClick('wallet_tab_toggle', { selected: 'deposit' })
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    actionType === 'deposit'
                      ? 'bg-accent-success text-white'
                      : 'bg-dark-tertiary text-dark-muted hover:text-white'
                  }`}
                >
                  Add Money
                </button>
                <button
                  onClick={() => {
                    setActionType('withdraw')
                    trackClick('wallet_tab_toggle', { selected: 'withdraw' })
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    actionType === 'withdraw'
                      ? 'bg-accent-danger text-white'
                      : 'bg-dark-tertiary text-dark-muted hover:text-white'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-tertiary border border-dark-border rounded-xl text-dark-text text-xl font-display placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                />
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => {
                      setAmount(amt.toString())
                      trackClick('quick_amount_select', { amount: amt, action_type: actionType })
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      amount === amt.toString()
                        ? 'bg-accent-primary text-white'
                        : 'bg-dark-tertiary text-dark-muted hover:text-white hover:bg-dark-border'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Message */}
              {message.text && (
                <div className={`p-3 rounded-lg mb-4 ${
                  message.type === 'success' 
                    ? 'bg-accent-success/10 text-accent-success' 
                    : 'bg-accent-danger/10 text-accent-danger'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleAction}
                loading={processing}
                className="w-full"
                variant={actionType === 'deposit' ? 'success' : 'danger'}
                size="lg"
              >
                {actionType === 'deposit' ? 'Add Money' : 'Withdraw'}
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-dark-border">
                <h2 className="font-semibold text-white">Transaction History</h2>
              </div>

              {transactions.length > 0 ? (
                <div className="divide-y divide-dark-border max-h-[600px] overflow-y-auto">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-dark-tertiary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'DEPOSIT' ? 'bg-accent-success/10' :
                          tx.type === 'WITHDRAW' ? 'bg-accent-danger/10' :
                          tx.type === 'BUY' ? 'bg-accent-primary/10' :
                          'bg-accent-warning/10'
                        }`}>
                          {tx.type === 'DEPOSIT' && (
                            <svg className="w-5 h-5 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          )}
                          {tx.type === 'WITHDRAW' && (
                            <svg className="w-5 h-5 text-accent-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                          {tx.type === 'BUY' && (
                            <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          {tx.type === 'SELL' && (
                            <svg className="w-5 h-5 text-accent-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {tx.type === 'DEPOSIT' ? 'Added Money' :
                             tx.type === 'WITHDRAW' ? 'Withdrawn' :
                             tx.type === 'BUY' ? `Bought ${tx.symbol}` :
                             `Sold ${tx.symbol}`}
                          </p>
                          <p className="text-xs text-dark-muted">
                            {new Date(tx.timestamp).toLocaleString()}
                            {tx.quantity && ` • ${tx.quantity} shares @ ₹${tx.priceAtTransaction?.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-medium ${
                        tx.type === 'DEPOSIT' || tx.type === 'SELL' ? 'text-accent-success' : 'text-accent-danger'
                      }`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'SELL' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                  <p className="text-dark-muted">Add money to start trading</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet

