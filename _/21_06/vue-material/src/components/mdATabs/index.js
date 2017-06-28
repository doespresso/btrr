import mdTabs from './mdATabs.vue';
import mdTab from './mdATab.vue';
import mdTabsTheme from './mdATabs.theme';

export default function install(Vue) {
  Vue.component('md-a-tabs', mdTabs);
  Vue.component('md-a-tab', mdTab);

  Vue.material.styles.push(mdTabsTheme);
}
