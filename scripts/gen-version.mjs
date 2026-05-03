import { writeFileSync } from 'fs'
writeFileSync('dist/version.json', JSON.stringify({ version: new Date().toISOString() }))
