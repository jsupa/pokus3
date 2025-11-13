import { I18n } from 'i18n'
import YAML from 'yaml'

const ExpressConfig = new I18n({
  locales: ['en', 'ru', 'sk'],
  extension: '.yaml',
  directory: './locales',
  parser: YAML,
  objectNotation: true,
})

export { ExpressConfig }
