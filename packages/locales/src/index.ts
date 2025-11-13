import { I18n } from 'i18n'
import YAML from 'yaml'

const ExpressConfig = new I18n({
  locales: ['en'],
  extension: '.yml',
  directory: './backend',
  parser: YAML,
  objectNotation: true,
})

export { ExpressConfig }
