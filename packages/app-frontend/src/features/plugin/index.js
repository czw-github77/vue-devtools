import Vue from 'vue'
import { computed, ref } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { getBridge } from '../bridge'
import { useCurrentApp } from '../apps'

const pluginsPerApp = ref({})

function getPlugins (appId) {
  let plugins = pluginsPerApp.value[appId]
  if (!plugins) {
    plugins = []
    Vue.set(pluginsPerApp.value, appId, plugins)
    // Read the property again to make it reactive
    plugins = pluginsPerApp.value[appId]
  }
  return plugins
}

function fetchPlugins () {
  getBridge().send(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, {})
}

export function usePlugins () {
  const { currentAppId } = useCurrentApp()

  const plugins = computed(() => getPlugins(currentAppId.value))

  return {
    plugins
  }
}

export function useComponentStateTypePlugin () {
  const { plugins } = usePlugins()

  function getStateTypePlugin (type) {
    return plugins.value.find(p => p.componentStateTypes && p.componentStateTypes.includes(type))
  }

  return {
    getStateTypePlugin
  }
}

export function setupPluginsBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, ({ plugin }) => {
    getPlugins(plugin.appId).push(plugin)
  })

  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, ({ plugins }) => {
    for (const plugin of plugins) {
      getPlugins(plugin.appId).push(plugin)
    }
  })

  fetchPlugins()
}
