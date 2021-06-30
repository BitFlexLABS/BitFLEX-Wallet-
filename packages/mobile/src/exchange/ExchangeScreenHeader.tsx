import Touchable from '@celo/react-components/components/Touchable'
import DownArrowIcon from '@celo/react-components/icons/DownArrowIcon'
import colors from '@celo/react-components/styles/colors'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CeloExchangeEvents } from 'src/analytics/Events'
import CancelButton from 'src/components/CancelButton'
import CustomHeader from 'src/components/header/CustomHeader'
import TokenBottomSheet, { TokenPickerOrigin } from 'src/components/TokenBottomSheet'
import { STABLE_TRANSACTION_MIN_AMOUNT } from 'src/config'
import i18n from 'src/i18n'
import { localCurrencyExchangeRatesSelector } from 'src/localCurrency/selectors'
import { HeaderTitleWithBalance, styles as headerStyles } from 'src/navigator/Headers'
import useSelector from 'src/redux/useSelector'
import { balancesSelector } from 'src/stableToken/selectors'
import { Currency, STABLE_CURRENCIES } from 'src/utils/currencies'

interface Props {
  currency: Currency
  makerToken: Currency | null
  onChangeCurrency: (currency: Currency) => void
}

function ExchangeTradeScreenHeader({ currency, makerToken, onChangeCurrency }: Props) {
  const [showingTokenPicker, setShowTokenPicker] = useState(false)

  const onCurrencySelected = (currency: Currency) => {
    setShowTokenPicker(false)
    onChangeCurrency(currency)
  }

  const closeCurrencyPicker = () => setShowTokenPicker(false)

  const isCeloPurchase = makerToken !== Currency.Celo
  const balances = useSelector(balancesSelector)
  const exchangeRates = useSelector(localCurrencyExchangeRatesSelector)

  const title = useMemo(() => {
    const currenciesWithBalance = STABLE_CURRENCIES.filter(
      (currency) =>
        balances[currency]?.gt(STABLE_TRANSACTION_MIN_AMOUNT) && exchangeRates[currency] !== null
    ).length

    let titleText
    let title
    const singleTokenAvailable = currenciesWithBalance < 2
    if (singleTokenAvailable) {
      title = isCeloPurchase ? i18n.t('exchangeFlow9:buyGold') : i18n.t('exchangeFlow9:sellGold')
    } else {
      titleText = i18n.t('exchangeFlow9:tokenBalance', { token: currency })
      title = (
        <View style={styles.titleContainer} testID="HeaderCurrencyPicker">
          <Text style={headerStyles.headerSubTitle}>{titleText}</Text>
          <DownArrowIcon color={colors.gray3} />
        </View>
      )
    }

    return (
      <Touchable disabled={singleTokenAvailable} onPress={() => setShowTokenPicker(true)}>
        <HeaderTitleWithBalance title={title} token={currency} switchTitleAndSubtitle={true} />
      </Touchable>
    )
  }, [currency])

  const cancelEventName = isCeloPurchase
    ? CeloExchangeEvents.celo_buy_cancel
    : CeloExchangeEvents.celo_sell_cancel

  return (
    <>
      <CustomHeader left={<CancelButton eventName={cancelEventName} />} title={title} />
      <TokenBottomSheet
        isVisible={showingTokenPicker}
        origin={TokenPickerOrigin.Exchange}
        onCurrencySelected={onCurrencySelected}
        onClose={closeCurrencyPicker}
      />
    </>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
  },
})

export default ExchangeTradeScreenHeader
