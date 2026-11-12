// Renan | renancodando
import {adaptarExperimento} from './adaptador.js';
const carregar=()=>import('../../laboratorios/axioma.js');
export const {montar}=adaptarExperimento(carregar,'geometria');
export const montarTransformacoes=adaptarExperimento(carregar,'transformacoes').montar;
