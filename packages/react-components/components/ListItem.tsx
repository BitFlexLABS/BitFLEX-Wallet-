import Touchable from '@celo/react-components/components/Touchable'
import variables from '@celo/react-components/styles/variables'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

interface Props {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  testID?: string
}

export default function ListItem({ children, onPress, disabled, testID }: Props) {
  return (
    <View style={styles.container}>
      {onPress ? (
        <Touchable onPress={onPress} borderless={true} disabled={disabled} testID={testID}>
          <View style={styles.innerView}>{children}</View>
        </Touchable>
      ) : (
        <View style={styles.innerView}>{children}</View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  innerView: {
    paddingVertical: variables.contentPadding,
    borderBottomWidth: 1,
    borderBottomColor: '#535353',
    marginLeft: variables.contentPadding,
  },
})
