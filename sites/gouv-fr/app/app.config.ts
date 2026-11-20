import { routes, routeTitles } from '#layers/gouv-fr/routes'

export default defineAppConfig({
  siteName: 'algos.data.gouv.fr',
  navigation: [
    { text: routeTitles.reference, to: routes.reference },
  ],
})
