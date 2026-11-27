import UiRuleForm from '@datagouv/algos-site-gouv-fr/app/components/UiRuleForm.vue'
import { defineCustomElement } from 'vue'
import '@gouvminint/vue-dsfr/styles'
import '@shallowred/formulaires-vue-dsfr/styles'

// rendered in the light DOM, so that the DSFR stylesheet of the host page applies
customElements.define('rule-form', defineCustomElement(UiRuleForm, { shadowRoot: false }))
