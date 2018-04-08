import Vue from 'vue'
import App from './app.vue'

import './assets/styles/global.styl'

//创建节点
const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
    render:(h)=>h(App)
}).$mount(root)