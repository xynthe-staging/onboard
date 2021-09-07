import { networkName } from '../../utilities'
import {
  WalletCheckModal,
  StateAndHelpers,
  WalletCheckCustomOptions,
  AppState
} from '../../interfaces'
import { networkIcon } from './icons'

import { app } from '../../stores'

function network(
  options: WalletCheckCustomOptions = {}
): (currentState: StateAndHelpers) => Promise<WalletCheckModal | undefined> {
  const { heading, description, icon, html, button } = options

  return async (stateAndHelpers: StateAndHelpers) => {
    const {
      network,
      appNetworkId,
      walletSelect,
      walletCheck,
      exit,
      stateSyncStatus,
      stateStore
    } = stateAndHelpers

    if (network === null) {
      // wait for network sync if is still on initial value
      if (stateSyncStatus.network) {
        await new Promise(resolve => {
          stateSyncStatus.network && stateSyncStatus.network.then(resolve)

          setTimeout(() => {
            if (network === null) {
              // if prom isn't resolving after 500ms, then stop waiting
              resolve(undefined)
            }
          }, 500)
        })
      }
    }

    if (stateStore.network.get() != appNetworkId) {
      return {
        heading: heading || 'You Must Change Networks',
        description:
          description ||
          `We've detected that you need to switch your wallet's network from ${networkName(
            network
          )} to ${networkName(
            appNetworkId
          )} for this Dapp. Some wallets may not support changing networks. If you can not change networks in your wallet you may consider switching to a different wallet.`,
        eventCode: 'networkFail',
        button: button || {
          onclick: async () => {
            exit(false, { switchingWallets: true })
            const walletSelected = await walletSelect()
            const walletReady = walletSelected && (await walletCheck())

            app.update((store: AppState) => ({
              ...store,
              switchingWallets: false,
              walletCheckCompleted: walletReady
            }))
          },
          text: 'Switch Wallet'
        },
        html,
        icon: icon || networkIcon
      }
    }
  }
}

export default network
