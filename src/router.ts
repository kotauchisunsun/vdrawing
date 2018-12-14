import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import InMemoryLineRepository from './InMemoryLineRepository';
import GasLineRepository from './GasLineRepository';

const url = 'https://script.google.com/macros/s/AKfycbzoFqga9hS4Q3v6XtPkqjO2-vZX_sWMG2Z6jS_d47nGRrenjHd_/exec';
const repository = new GasLineRepository(url);

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      props: {
        repository,
      },
    },
  ],
});
