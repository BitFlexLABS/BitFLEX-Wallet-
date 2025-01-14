import { CURRENCY_ENUM } from '@celo/utils/lib/currencies'
import BigNumber from 'bignumber.js'
import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { TokenTransactionType } from 'src/apollo/types'
import { fetchDollarBalance, setBalance, transferStableToken } from 'src/stableToken/actions'
import { stableTokenFetch, stableTokenTransfer } from 'src/stableToken/saga'
import { addStandbyTransaction, removeStandbyTransaction } from 'src/transactions/actions'
import { TransactionStatus } from 'src/transactions/types'
import { getContractKitAsync } from 'src/web3/contracts'
import { waitWeb3LastBlock } from 'src/web3/saga'
import { createMockStore } from 'test/utils'
import { mockAccount } from 'test/values'

const now = Date.now()
Date.now = jest.fn(() => now)

const BALANCE = '1'
const TX_ID = '1234'
const COMMENT = 'a comment'

jest.mock('src/web3/actions', () => ({
  ...(jest.requireActual('src/web3/actions') as any),
  unlockAccount: jest.fn(async () => true),
}))

const { unlockAccount } = require('src/web3/actions')

const state = createMockStore().getState()

const TRANSFER_ACTION = transferStableToken({
  recipientAddress: mockAccount,
  amount: BALANCE,
  comment: COMMENT,
  context: { id: TX_ID },
})

describe('stableToken saga', () => {
  jest.useRealTimers()

  it('should fetch the balance and put the new balance', async () => {
    await expectSaga(stableTokenFetch)
      .provide([[call(waitWeb3LastBlock), true]])
      .withState(state)
      .dispatch(fetchDollarBalance())
      .put(setBalance(BALANCE))
      .run()
  })

  it('should not update the balance if it is too large', async () => {
    const stableToken = await (await getContractKitAsync()).contracts.getStableToken()
    // @ts-ignore Jest Mock
    stableToken.balanceOf.mockResolvedValueOnce(new BigNumber(10000001))
    await expectSaga(stableTokenFetch)
      .provide([[call(waitWeb3LastBlock), true]])
      .withState(state)
      .dispatch(fetchDollarBalance())
      .run()
  })

  it('should add a standby transaction and dispatch a sendAndMonitorTransaction', async () => {
    await expectSaga(stableTokenTransfer)
      .provide([[call(waitWeb3LastBlock), true]])
      .withState(state)
      .dispatch(TRANSFER_ACTION)
      .put(
        addStandbyTransaction({
          context: { id: TX_ID },
          type: TokenTransactionType.Sent,
          comment: COMMENT,
          status: TransactionStatus.Pending,
          value: BALANCE,
          symbol: CURRENCY_ENUM.DOLLAR,
          timestamp: Math.floor(Date.now() / 1000),
          address: mockAccount,
        })
      )
      .run()
  })

  it('should add a standby transaction', async () => {
    await expectSaga(stableTokenTransfer)
      .provide([[call(waitWeb3LastBlock), true]])
      .withState(state)
      .dispatch(TRANSFER_ACTION)
      .put(
        addStandbyTransaction({
          context: { id: TX_ID },
          type: TokenTransactionType.Sent,
          comment: COMMENT,
          status: TransactionStatus.Pending,
          value: BALANCE,
          symbol: CURRENCY_ENUM.DOLLAR,
          timestamp: Math.floor(Date.now() / 1000),
          address: mockAccount,
        })
      )
      .run()
  })

  it('should remove standby transaction when pin unlock fails', async () => {
    unlockAccount.mockImplementationOnce(async () => false)

    await expectSaga(stableTokenTransfer)
      .provide([[call(waitWeb3LastBlock), true]])
      .withState(state)
      .dispatch(TRANSFER_ACTION)
      .put(removeStandbyTransaction(TX_ID))
      .run()
  })
})
