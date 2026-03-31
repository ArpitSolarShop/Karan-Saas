# 📦 Exhaustive Package & Dependencies Blueprint

> Complete unedited package.json, requirements.txt, and Gemfile dumps from all 9 SaaS projects to ensure 100% dependency preservation.

## chatwoot

### chatwoot/Gemfile
```ruby
source 'https://rubygems.org'

ruby '3.4.4'

##-- base gems for rails --##
gem 'rack-cors', '2.0.0', require: 'rack/cors'
gem 'rails', '~> 7.1'
# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', require: false

##-- rails application helper gems --##
gem 'acts-as-taggable-on'
gem 'attr_extras'
gem 'browser'
gem 'hashie'
gem 'jbuilder'
gem 'kaminari'
gem 'responders', '>= 3.1.1'
gem 'rest-client'
gem 'telephone_number'
gem 'time_diff'
gem 'tzinfo-data'
gem 'valid_email2'
gem 'email-provider-info'
# compress javascript config.assets.js_compressor
gem 'uglifier'
##-- used for single column multiple binary flags in notification settings/feature flagging --##
gem 'flag_shih_tzu'
# Random name generator for user names
gem 'haikunator'
# Template parsing safely
gem 'liquid'
# Parse Markdown to HTML
gem 'commonmarker'
# Validate Data against JSON Schema
gem 'json_schemer'
# used in swagger build
gem 'json_refs'
# Rack middleware for blocking & throttling abusive requests
gem 'rack-attack', '>= 6.7.0'
# a utility tool for streaming, flexible and safe downloading of remote files
gem 'down'
# authentication type to fetch and send mail over oauth2.0
gem 'gmail_xoauth'
# Lock net-smtp to 0.3.4 to avoid issues with gmail_xoauth2
gem 'net-smtp',  '~> 0.3.4'
# Prevent CSV injection
gem 'csv-safe'

##-- for active storage --##
gem 'aws-sdk-s3', require: false
# original gem isn't maintained actively
# we wanted updated version of faraday which is a dependency for slack-ruby-client
gem 'azure-storage-blob', git: 'https://github.com/chatwoot/azure-storage-ruby', branch: 'chatwoot', require: false
gem 'google-cloud-storage', '>= 1.48.0', require: false
gem 'image_processing'

##-- for actionmailbox --##
gem 'aws-actionmailbox-ses', '~> 0'

##-- gems for database --#
gem 'groupdate'
gem 'pg'
gem 'redis'
gem 'redis-namespace'
# super fast record imports in bulk
gem 'activerecord-import'

gem 'searchkick'
gem 'opensearch-ruby'
gem 'faraday_middleware-aws-sigv4'

##--- gems for server & infra configuration ---##
gem 'dotenv-rails', '>= 3.0.0'
gem 'foreman'
gem 'puma'
gem 'vite_rails'
# metrics on heroku
gem 'barnes'

##--- gems for authentication & authorization ---##
gem 'devise', '>= 4.9.4'
gem 'devise-secure_password', git: 'https://github.com/chatwoot/devise-secure_password', branch: 'chatwoot'
gem 'devise_token_auth', '>= 1.2.3'
# two-factor authentication
gem 'devise-two-factor', '>= 5.0.0'
# authorization
gem 'jwt'
gem 'pundit'

# super admin
gem 'administrate', '>= 0.20.1'
gem 'administrate-field-active_storage', '>= 1.0.3'
gem 'administrate-field-belongs_to_search', '>= 0.9.0'

##--- gems for pubsub service ---##
# https://karolgalanciak.com/blog/2019/11/30/from-activerecord-callbacks-to-publish-slash-subscribe-pattern-and-event-driven-design/
gem 'wisper', '2.0.0'

##--- gems for channels ---##
gem 'facebook-messenger'
gem 'line-bot-api'
gem 'twilio-ruby'
# twitty will handle subscription of twitter account events
# gem 'twitty', git: 'https://github.com/chatwoot/twitty'
gem 'twitty', '~> 0.1.5'
# facebook client
gem 'koala'
# slack client
gem 'slack-ruby-client', '~> 2.7.0'
# for dialogflow integrations
gem 'google-cloud-dialogflow-v2', '>= 0.24.0'
gem 'grpc'
# Translate integrations
# 'google-cloud-translate' gem depends on faraday 2.0 version
# this dependency breaks the slack-ruby-client gem
gem 'google-cloud-translate-v3', '>= 0.7.0'

##-- apm and error monitoring ---#
# loaded only when environment variables are set.
# ref application.rb
gem 'datadog', '~> 2.0', require: false
gem 'elastic-apm', require: false
gem 'newrelic_rpm', require: false
gem 'newrelic-sidekiq-metrics', '>= 1.6.2', require: false
gem 'scout_apm', require: false
gem 'sentry-rails', '>= 5.19.0', require: false
gem 'sentry-ruby', require: false
gem 'sentry-sidekiq', '>= 5.19.0', require: false

##-- background job processing --##
gem 'sidekiq', '>= 7.3.1'
# We want cron jobs
gem 'sidekiq-cron', '>= 1.12.0'
# for sidekiq healthcheck
gem 'sidekiq_alive'

##-- Push notification service --##
gem 'fcm'
gem 'web-push', '>= 3.0.1'

##-- geocoding / parse location from ip --##
# http://www.rubygeocoder.com/
gem 'geocoder'
# to parse maxmind db
gem 'maxminddb'

# to create db triggers
gem 'hairtrigger'

gem 'procore-sift'

# parse email
gem 'email_reply_trimmer'

gem 'html2text'

# to calculate working hours
gem 'working_hours'

# full text search for articles
gem 'pg_search'

# Subscriptions, Billing
gem 'stripe', '~> 18.0'

## - helper gems --##
## to populate db with sample data
gem 'faker'

# Include logrange conditionally in intializer using env variable
gem 'lograge', '~> 0.14.0', require: false

# worked with microsoft refresh token
gem 'omniauth-oauth2'

gem 'audited', '~> 5.4', '>= 5.4.1'

# need for google auth
gem 'omniauth', '>= 2.1.2'
gem 'omniauth-saml'
gem 'omniauth-google-oauth2', '>= 1.1.3'
gem 'omniauth-rails_csrf_protection', '~> 1.0', '>= 1.0.2'

## Gems for reponse bot
# adds cosine similarity to postgres using vector extension
gem 'neighbor'
gem 'pgvector'
# Convert Website HTML to Markdown
gem 'reverse_markdown'

gem 'iso-639'
gem 'ruby-openai'
gem 'ai-agents', '>= 0.9.1'

# TODO: Move this gem as a dependency of ai-agents
gem 'ruby_llm', '>= 1.8.2'
gem 'ruby_llm-schema'

gem 'cld3', '~> 3.7'

# OpenTelemetry for LLM observability
gem 'opentelemetry-sdk'
gem 'opentelemetry-exporter-otlp'

gem 'shopify_api'

### Gems required only in specific deployment environments ###
##############################################################

group :production do
  # we dont want request timing out in development while using byebug
  gem 'rack-timeout'
  # for heroku autoscaling
  gem 'judoscale-rails', require: false
  gem 'judoscale-sidekiq', require: false
end

group :development do
  gem 'annotaterb'
  gem 'bullet'
  gem 'letter_opener'
  gem 'scss_lint', require: false
  gem 'web-console', '>= 4.2.1'

  # When we want to squash migrations
  gem 'squasher'

  # profiling
  gem 'rack-mini-profiler', '>= 3.2.0', require: false
  gem 'stackprof'
  # Should install the associated chrome extension to view query logs
  gem 'meta_request', '>= 0.8.3'

  gem 'tidewave'
end

group :test do
  # fast cleaning of database
  gem 'database_cleaner'
  # mock http calls
  gem 'webmock'
  # test profiling
  gem 'test-prof'
  gem 'simplecov_json_formatter', require: false
end

group :development, :test do
  gem 'active_record_query_trace'
  ##--- gems for debugging and error reporting ---##
  # static analysis
  gem 'brakeman'
  gem 'bundle-audit', require: false
  gem 'byebug', platform: :mri
  gem 'climate_control'
  gem 'debug', '~> 1.8'
  gem 'factory_bot_rails', '>= 6.4.3'
  gem 'listen'
  gem 'mock_redis'
  gem 'pry-rails'
  gem 'rspec_junit_formatter'
  gem 'rspec-rails', '>= 6.1.5'
  gem 'rubocop', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'rubocop-factory_bot', require: false
  gem 'seed_dump'
  gem 'shoulda-matchers'
  gem 'simplecov', '>= 0.21', require: false
  gem 'spring'
  gem 'spring-watcher-listen'
end

```

### chatwoot/package.json
```json
{
  "name": "@chatwoot/chatwoot",
  "version": "4.11.1",
  "license": "MIT",
  "scripts": {
    "eslint": "eslint app/**/*.{js,vue}",
    "eslint:fix": "eslint app/**/*.{js,vue} --fix",
    "test": "TZ=UTC vitest --no-watch --no-cache --no-coverage --logHeapUsage",
    "test:watch": "TZ=UTC vitest --no-cache --no-coverage",
    "test:coverage": "TZ=UTC vitest --no-watch --no-cache --coverage",
    "start:dev": "foreman start -f ./Procfile.dev",
    "start:test": "RAILS_ENV=test foreman start -f ./Procfile.test",
    "dev": "overmind start -f ./Procfile.dev",
    "ruby:prettier": "bundle exec rubocop -a",
    "build:sdk": "BUILD_MODE=library vite build",
    "prepare": "husky install",
    "size": "size-limit",
    "story:dev": "histoire dev",
    "story:build": "histoire build",
    "story:preview": "histoire preview",
    "sync:i18n": "bin/sync_i18n_file_change"
  },
  "size-limit": [
    {
      "path": "public/vite/assets/widget-*.js",
      "limit": "300 KB"
    },
    {
      "path": "public/packs/js/sdk.js",
      "limit": "40 KB"
    }
  ],
  "dependencies": {
    "@amplitude/analytics-browser": "^2.11.10",
    "@breezystack/lamejs": "^1.2.7",
    "@chatwoot/ninja-keys": "1.2.3",
    "@chatwoot/prosemirror-schema": "1.3.6",
    "@chatwoot/utils": "^0.0.52",
    "@formkit/core": "^1.6.7",
    "@formkit/vue": "^1.6.7",
    "@hcaptcha/vue3-hcaptcha": "^1.3.0",
    "@highlightjs/vue-plugin": "^2.1.0",
    "@iconify-json/fluent": "^1.2.32",
    "@iconify-json/material-symbols": "^1.2.10",
    "@lk77/vue3-color": "^3.0.6",
    "@radix-ui/colors": "^3.0.0",
    "@rails/actioncable": "6.1.3",
    "@rails/ujs": "^7.1.400",
    "@scmmishra/pico-search": "0.6.0",
    "@sentry/vue": "^8.55.0",
    "@sindresorhus/slugify": "2.2.1",
    "@tailwindcss/typography": "^0.5.15",
    "@tanstack/vue-table": "^8.20.5",
    "@twilio/voice-sdk": "^2.12.4",
    "@vitejs/plugin-vue": "^5.1.4",
    "@vue/compiler-sfc": "^3.5.8",
    "@vuelidate/core": "^2.0.3",
    "@vuelidate/validators": "^2.0.4",
    "@vueuse/components": "^12.0.0",
    "@vueuse/core": "^12.0.0",
    "activestorage": "^5.2.6",
    "axios": "^1.13.2",
    "camelcase-keys": "^9.1.3",
    "chart.js": "~4.4.4",
    "color2k": "^2.0.2",
    "company-email-validator": "^1.1.0",
    "core-js": "3.38.1",
    "countries-and-timezones": "^3.6.0",
    "date-fns": "2.21.1",
    "date-fns-tz": "^1.3.3",
    "dompurify": "3.2.4",
    "flag-icons": "^7.2.3",
    "floating-vue": "^5.2.2",
    "highlight.js": "^11.10.0",
    "html-to-image": "^1.11.13",
    "html2canvas": "^1.4.1",
    "idb": "^8.0.0",
    "js-cookie": "^3.0.5",
    "json-logic-js": "^2.0.5",
    "lettersanitizer": "^1.0.6",
    "libphonenumber-js": "^1.11.9",
    "markdown-it": "^13.0.2",
    "markdown-it-link-attributes": "^4.0.1",
    "md5": "^2.3.0",
    "mitt": "^3.0.1",
    "opus-recorder": "^8.0.5",
    "pinia": "^3.0.4",
    "qrcode": "^1.5.4",
    "semver": "7.6.3",
    "snakecase-keys": "^8.0.1",
    "timezone-phone-codes": "^0.0.2",
    "tinykeys": "^3.0.0",
    "turbolinks": "^5.2.0",
    "urlpattern-polyfill": "^10.0.0",
    "video.js": "7.18.1",
    "videojs-record": "4.5.0",
    "videojs-wavesurfer": "3.8.0",
    "virtua": "^0.48.6",
    "vue": "^3.5.12",
    "vue-chartjs": "5.3.1",
    "vue-datepicker-next": "^1.0.3",
    "vue-dompurify-html": "^5.1.0",
    "vue-i18n": "9.14.5",
    "vue-letter": "^0.2.1",
    "vue-router": "~4.4.5",
    "vue-upload-component": "^3.1.17",
    "vue3-click-away": "^1.2.4",
    "vuedraggable": "^4.1.0",
    "vuex": "~4.1.0",
    "vuex-router-sync": "6.0.0-rc.1",
    "wavesurfer.js": "7.8.6"
  },
  "devDependencies": {
    "@egoist/tailwindcss-icons": "^1.9.0",
    "@histoire/plugin-vue": "0.17.15",
    "@iconify-json/logos": "^1.2.10",
    "@iconify-json/lucide": "^1.2.82",
    "@iconify-json/ph": "^1.2.2",
    "@iconify-json/ri": "^1.2.6",
    "@iconify-json/teenyicons": "^1.2.2",
    "@intlify/eslint-plugin-vue-i18n": "^3.2.0",
    "@size-limit/file": "^8.2.4",
    "@vitest/coverage-v8": "3.0.5",
    "@vue/test-utils": "^2.4.6",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-config-airbnb-base": "15.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-interactive": "^11.1.0",
    "eslint-plugin-html": "7.1.0",
    "eslint-plugin-import": "2.30.0",
    "eslint-plugin-prettier": "5.2.1",
    "eslint-plugin-vitest-globals": "^1.5.0",
    "eslint-plugin-vue": "^9.28.0",
    "fake-indexeddb": "^6.0.0",
    "histoire": "0.17.15",
    "husky": "^7.0.0",
    "jsdom": "^27.2.0",
    "lint-staged": "^16.2.7",
    "postcss": "^8.4.47",
    "postcss-preset-env": "^8.5.1",
    "prettier": "^3.3.3",
    "prosemirror-model": "^1.22.3",
    "size-limit": "^8.2.4",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.21",
    "vite-plugin-ruby": "^5.0.0",
    "vitest": "3.0.5"
  },
  "engines": {
    "node": "24.x",
    "pnpm": "10.x"
  },
  "husky": {
    "hooks": {
      "pre-push": "sh bin/validate_push"
    }
  },
  "pnpm": {
    "overrides": {
      "vite-node": "2.0.1",
      "vite": "5.4.21",
      "vitest": "3.0.5"
    }
  },
  "lint-staged": {
    "app/**/*.{js,vue}": [
      "eslint --fix",
      "git add"
    ],
    "*.scss": [
      "scss-lint"
    ]
  },
  "packageManager": "pnpm@10.2.0+sha512.0d27364e0139c6aadeed65ada153135e0ca96c8da42123bd50047f961339dc7a758fc2e944b428f52be570d1bd3372455c1c65fa2e7aa0bfbf931190f9552001"
}

```

## erpnext

### erpnext/package.json
```json
{
  "name": "erpnext",
  "description": "Open Source ERP System powered by the Frappe Framework",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/frappe/erpnext.git"
  },
  "homepage": "https://frappe.io/erpnext",
  "author": "Frappe Technologies Pvt. Ltd.",
  "license": "GPL-3.0",
  "bugs": {
    "url": "https://github.com/frappe/erpnext/issues"
  },
  "devDependencies": {},
  "dependencies": {
    "onscan.js": "^1.5.2"
  }
}

```

## evolution-api

### evolution-api/package.json
```json
{
  "name": "evolution-api",
  "version": "2.3.7",
  "description": "Rest api for communication with WhatsApp",
  "main": "./dist/main.js",
  "type": "commonjs",
  "scripts": {
    "build": "tsc --noEmit && tsup",
    "start": "tsx ./src/main.ts",
    "start:prod": "node dist/main",
    "dev:server": "tsx watch ./src/main.ts",
    "test": "tsx watch ./test/all.test.ts",
    "lint": "eslint --fix --ext .ts src",
    "lint:check": "eslint --ext .ts src",
    "commit": "cz",
    "commitlint": "commitlint --edit",
    "db:generate": "node runWithProvider.js \"npx prisma generate --schema ./prisma/DATABASE_PROVIDER-schema.prisma\"",
    "db:deploy": "node runWithProvider.js \"rm -rf ./prisma/migrations && cp -r ./prisma/DATABASE_PROVIDER-migrations ./prisma/migrations && npx prisma migrate deploy --schema ./prisma/DATABASE_PROVIDER-schema.prisma\"",
    "db:deploy:win": "node runWithProvider.js \"xcopy /E /I prisma\\DATABASE_PROVIDER-migrations prisma\\migrations && npx prisma migrate deploy --schema prisma\\DATABASE_PROVIDER-schema.prisma\"",
    "db:studio": "node runWithProvider.js \"npx prisma studio --schema ./prisma/DATABASE_PROVIDER-schema.prisma\"",
    "db:migrate:dev": "node runWithProvider.js \"rm -rf ./prisma/migrations && cp -r ./prisma/DATABASE_PROVIDER-migrations ./prisma/migrations && npx prisma migrate dev --schema ./prisma/DATABASE_PROVIDER-schema.prisma && cp -r ./prisma/migrations/* ./prisma/DATABASE_PROVIDER-migrations\"",
    "db:migrate:dev:win": "node runWithProvider.js \"xcopy /E /I prisma\\DATABASE_PROVIDER-migrations prisma\\migrations && npx prisma migrate dev --schema prisma\\DATABASE_PROVIDER-schema.prisma\"",
    "prepare": "husky"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/EvolutionAPI/evolution-api.git"
  },
  "keywords": [
    "chat",
    "communication",
    "message",
    "send message",
    "whatsapp",
    "js-whatsapp",
    "whatsapp-api",
    "whatsapp-web",
    "whatsapp",
    "whatsapp-chat",
    "whatsapp-group",
    "automation",
    "multi-device",
    "bot"
  ],
  "author": {
    "name": "Davidson Gomes",
    "email": "contato@evolution-api.com"
  },
  "license": "Apache-2.0",
  "bugs": {
    "url": "https://github.com/EvolutionAPI/evolution-api/issues"
  },
  "homepage": "https://github.com/EvolutionAPI/evolution-api#readme",
  "lint-staged": {
    "src/**/*.{ts,js}": [
      "eslint --fix"
    ],
    "src/**/*.ts": [
      "sh -c 'tsc --noEmit'"
    ]
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "dependencies": {
    "@adiwajshing/keyed-db": "^0.2.4",
    "@aws-sdk/client-sqs": "^3.891.0",
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@figuro/chatwoot-sdk": "^1.1.16",
    "@hapi/boom": "^10.0.1",
    "@paralleldrive/cuid2": "^2.2.2",
    "@prisma/client": "^6.16.2",
    "@sentry/node": "^10.12.0",
    "@types/uuid": "^10.0.0",
    "amqplib": "^0.10.5",
    "audio-decode": "^2.2.3",
    "axios": "^1.7.9",
    "baileys": "7.0.0-rc.9",
    "class-validator": "^0.14.1",
    "compression": "^1.7.5",
    "cors": "^2.8.5",
    "dayjs": "^1.11.13",
    "dotenv": "^16.4.7",
    "emoji-regex": "^10.4.0",
    "eventemitter2": "^6.4.9",
    "express": "^4.21.2",
    "express-async-errors": "^3.1.1",
    "fluent-ffmpeg": "^2.1.3",
    "form-data": "^4.0.1",
    "https-proxy-agent": "^7.0.6",
    "fetch-socks": "^1.3.2",
    "i18next": "^23.7.19",
    "jimp": "^1.6.0",
    "json-schema": "^0.4.0",
    "jsonschema": "^1.4.1",
    "jsonwebtoken": "^9.0.2",
    "kafkajs": "^2.2.4",
    "libphonenumber-js": "^1.12.25",
    "link-preview-js": "^3.0.13",
    "long": "^5.2.3",
    "mediainfo.js": "^0.3.4",
    "mime": "^4.0.0",
    "mime-types": "^2.1.35",
    "minio": "^8.0.3",
    "multer": "^2.0.2",
    "nats": "^2.29.1",
    "node-cache": "^5.1.2",
    "node-cron": "^3.0.3",
    "openai": "^4.77.3",
    "pg": "^8.13.1",
    "pino": "^9.10.0",
    "prisma": "^6.1.0",
    "pusher": "^5.2.0",
    "qrcode": "^1.5.4",
    "qrcode-terminal": "^0.12.0",
    "redis": "^4.7.0",
    "rxjs": "^7.8.2",
    "sharp": "^0.34.2",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "socks-proxy-agent": "^8.0.5",
    "swagger-ui-express": "^5.0.1",
    "tsup": "^8.3.5",
    "undici": "^7.16.0",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.18",
    "@types/json-schema": "^7.0.15",
    "@types/mime": "^4.0.0",
    "@types/mime-types": "^2.1.4",
    "@types/node": "^24.5.2",
    "@types/node-cron": "^3.0.11",
    "@types/qrcode": "^1.5.5",
    "@types/qrcode-terminal": "^0.12.2",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "commitizen": "^4.3.1",
    "cz-conventional-changelog": "^3.3.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-prettier": "^5.2.1",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "husky": "^9.1.7",
    "lint-staged": "^16.1.6",
    "prettier": "^3.4.2",
    "tsconfig-paths": "^4.2.0",
    "tsx": "^4.20.5",
    "typescript": "^5.7.2"
  }
}

```

## frappe_docker

### frappe_docker/requirements-test.txt
```text
pytest==9.0.2

```

## jasmin

### jasmin/misc/doc/requirements.txt
```text
furo~=2023.9.10

```

### jasmin/requirements-test.txt
```text
testfixtures>=3.0.0
sphinx>=1.1.0
pylint
coverage
coveralls

# Sphinx theme
furo~=2023.9.10

```

### jasmin/requirements.txt
```text
pyasn1~=0.5.0

# @TODO: Upgrade on dependabot issue
# https://github.com/jookies/jasmin/security/dependabot/19
Twisted~=23.10.0

treq~=23.11.0
pyparsing~=3.1.1
python-dateutil~=2.8.2
service_identity~=23.1.0
lockfile~=0.12.2

falcon~=3.1.1
txredisapi~=1.4.7
tabulate~=0.8.7

txAMQP3~=0.9.4
smpp.pdu3~=0.6
smpp.twisted3~=0.8
python-messaging~=0.5.13

# Upgrade to min. 41.0.5
# https://github.com/jookies/jasmin/security/dependabot/19
cryptography~=41.0.5
pyopenssl~=23.3.0

# Added in 0.9rc16:
celery~=5.3.5
redis~=5.0.1

# Upgraded on dependabot issue
# https://github.com/jookies/jasmin/security/dependabot/14
requests~=2.31.0

# For REST API
python-mimeparse~=1.6.0

# For /metrics (prometheus exporter)
prometheus-client~=0.18.0

```

## n8n

### n8n/.github/scripts/package.json
```json
{
  "dependencies": {
    "cacheable-lookup": "6.1.0",
    "conventional-changelog": "^4.0.0",
    "debug": "4.3.4",
    "glob": "10.5.0",
    "p-limit": "3.1.0",
    "picocolors": "1.0.1",
    "semver": "7.5.4",
    "tempfile": "5.0.0"
  }
}

```

### n8n/package.json
```json
{
  "name": "n8n-monorepo",
  "version": "2.10.0",
  "private": true,
  "engines": {
    "node": ">=22.16",
    "pnpm": ">=10.22.0"
  },
  "packageManager": "pnpm@10.22.0",
  "scripts": {
    "prepare": "node scripts/prepare.mjs",
    "preinstall": "node scripts/block-npm-install.js",
    "build": "turbo run build",
    "build:n8n": "node scripts/build-n8n.mjs",
    "build:deploy": "node scripts/build-n8n.mjs",
    "build:docker": "node scripts/build-n8n.mjs && node scripts/dockerize-n8n.mjs",
    "build:docker:coverage": "BUILD_WITH_COVERAGE=true node scripts/build-n8n.mjs && node scripts/dockerize-n8n.mjs",
    "build:docker:scan": "node scripts/build-n8n.mjs && node scripts/dockerize-n8n.mjs && node scripts/scan-n8n-image.mjs",
    "build:docker:test": "node scripts/build-n8n.mjs && node scripts/dockerize-n8n.mjs && turbo run test:container:standard --filter=n8n-playwright",
    "typecheck": "turbo typecheck",
    "dev": "turbo run dev --parallel --env-mode=loose --filter=!@n8n/design-system --filter=!@n8n/chat --filter=!@n8n/task-runner",
    "dev:be": "turbo run dev --parallel --env-mode=loose --filter=!@n8n/design-system --filter=!@n8n/chat --filter=!@n8n/task-runner --filter=!n8n-editor-ui",
    "dev:ai": "turbo run dev --parallel --env-mode=loose --filter=@n8n/nodes-langchain --filter=n8n --filter=n8n-core",
    "dev:fe": "run-p start \"dev:fe:editor --filter=@n8n/design-system\"",
    "dev:fe:editor": "turbo run dev --parallel --env-mode=loose --filter=n8n-editor-ui",
    "dev:e2e": "pnpm --filter=n8n-playwright dev --ui",
    "clean": "turbo run clean",
    "reset": "node scripts/ensure-zx.mjs && zx scripts/reset.mjs",
    "format": "turbo run format && node scripts/format.mjs",
    "format:check": "turbo run format:check",
    "lint": "turbo run lint",
    "lint:styles": "turbo run lint:styles",
    "lint:styles:fix": "turbo run lint:styles:fix",
    "lint:affected": "turbo run lint --affected",
    "lint:fix": "turbo run lint:fix",
    "optimize-svg": "find ./packages -name '*.svg' ! -name 'pipedrive.svg' -print0 | xargs -0 -P16 -L20 npx svgo",
    "generate:third-party-licenses": "node scripts/generate-third-party-licenses.mjs",
    "setup-backend-module": "node scripts/ensure-zx.mjs && zx scripts/backend-module/setup.mjs",
    "start": "node scripts/os-normalize.mjs --dir packages/cli/bin n8n",
    "test": "JEST_JUNIT_CLASSNAME={filepath} turbo run test",
    "test:ci": "turbo run test --continue --concurrency=1",
    "test:ci:frontend": "turbo run test --continue --filter='./packages/frontend/**'",
    "test:ci:backend": "turbo run test --continue --concurrency=1 --filter='!./packages/frontend/**'",
    "test:ci:backend:unit": "turbo run test:unit --continue --filter='!./packages/frontend/**'",
    "test:ci:backend:integration": "turbo run test:integration --continue --concurrency=1 --filter='!./packages/frontend/**'",
    "test:affected": "turbo run test --affected --concurrency=1",
    "test:with:docker": "pnpm --filter=n8n-playwright test:container:standard",
    "test:show:report": "pnpm --filter=n8n-playwright exec playwright show-report",
    "watch": "turbo run watch --concurrency=30",
    "webhook": "./packages/cli/bin/n8n webhook",
    "worker": "./packages/cli/bin/n8n worker"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.26.0",
    "@biomejs/biome": "^1.9.0",
    "@n8n/eslint-config": "workspace:*",
    "@types/jest": "^29.5.3",
    "@types/node": "*",
    "@types/supertest": "^6.0.3",
    "babel-plugin-transform-import-meta": "^2.3.2",
    "cross-env": "^7.0.3",
    "eslint": "catalog:",
    "jest": "^29.6.2",
    "jest-environment-jsdom": "^29.6.2",
    "jest-expect-message": "^1.1.3",
    "jest-junit": "^16.0.0",
    "jest-mock": "^29.6.2",
    "jest-mock-extended": "^3.0.4",
    "lefthook": "^1.7.15",
    "license-checker": "^25.0.1",
    "nock": "^14.0.1",
    "nodemon": "^3.0.1",
    "npm-run-all2": "^7.0.2",
    "p-limit": "^3.1.0",
    "rimraf": "^5.0.1",
    "supertest": "^7.1.1",
    "ts-jest": "^29.1.1",
    "tsc-alias": "^1.8.10",
    "tsc-watch": "^6.2.0",
    "turbo": "2.8.9",
    "typescript": "*",
    "zx": "^8.1.4"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "isolated-vm",
      "sqlite3"
    ],
    "overrides": {
      "@isaacs/brace-expansion": "5.0.1",
      "libphonenumber-js": "npm:empty-npm-package@1.0.0",
      "ast-types": "0.16.1",
      "@azure/identity": "4.13.0",
      "@lezer/common": "^1.2.0",
      "@mistralai/mistralai": "^1.10.0",
      "@n8n/typeorm>@sentry/node": "catalog:sentry",
      "@types/node": "^20.17.50",
      "axios": "1.13.5",
      "chokidar": "4.0.3",
      "esbuild": "^0.25.0",
      "expr-eval@2.0.2": "npm:expr-eval-fork@3.0.0",
      "multer": "^2.0.2",
      "prebuild-install": "7.1.3",
      "pug": "^3.0.3",
      "semver": "^7.5.4",
      "tar-fs": "2.1.4",
      "tslib": "^2.6.2",
      "tsconfig-paths": "^4.2.0",
      "typescript": "catalog:",
      "vue-tsc": "^2.2.8",
      "gaxios": ">=7.1.1",
      "google-gax": "^4.3.7",
      "ws": ">=8.17.1",
      "brace-expansion@1": "1.1.12",
      "brace-expansion@2": "2.0.2",
      "date-fns": "2.30.0",
      "date-fns-tz": "2.0.0",
      "form-data": "4.0.4",
      "tmp": "0.2.4",
      "nodemailer": "7.0.11",
      "validator": "13.15.26",
      "zod": "3.25.67",
      "js-yaml": "4.1.1",
      "node-forge": "1.3.2",
      "body-parser": "2.2.1",
      "glob@10": "10.5.0",
      "glob@7": "7.2.3",
      "jws@3": "3.2.2",
      "jws@4": "4.0.1",
      "qs@6": "6.14.2",
      "@smithy/config-resolver": ">=4.4.0",
      "@rudderstack/rudder-sdk-node@<=3.0.0": "3.0.0",
      "diff": "8.0.3",
      "undici@6": "^6.23.0",
      "undici@7": "^7.18.2",
      "tar": "^7.5.8",
      "fast-xml-parser": "5.3.6",
      "hono": "4.11.10",
      "ajv@6": "6.14.0",
      "ajv@7": "8.18.0",
      "ajv@8": "8.18.0",
      "bn.js@4": "5.2.3",
      "bn.js@5": "5.2.3",
      "minimatch@9": "10.2.1",
      "minimatch@10": "10.2.1",
      "langsmith": ">=0.4.6",
      "lodash-es": "4.17.23"
    },
    "patchedDependencies": {
      "bull@4.16.4": "patches/bull@4.16.4.patch",
      "pdfjs-dist@5.3.31": "patches/pdfjs-dist@5.3.31.patch",
      "pkce-challenge@5.0.0": "patches/pkce-challenge@5.0.0.patch",
      "@types/express-serve-static-core@5.0.6": "patches/@types__express-serve-static-core@5.0.6.patch",
      "@types/ws@8.18.1": "patches/@types__ws@8.18.1.patch",
      "@types/uuencode@0.0.3": "patches/@types__uuencode@0.0.3.patch",
      "vue-tsc@2.2.8": "patches/vue-tsc@2.2.8.patch",
      "element-plus@2.4.3": "patches/element-plus@2.4.3.patch",
      "js-base64": "patches/js-base64.patch",
      "ics": "patches/ics.patch",
      "minifaker": "patches/minifaker.patch",
      "z-vue-scan": "patches/z-vue-scan.patch",
      "@lezer/highlight": "patches/@lezer__highlight.patch",
      "v-code-diff": "patches/v-code-diff.patch",
      "assert@2.1.0": "patches/assert@2.1.0.patch"
    }
  }
}

```

### n8n/packages/cli/package.json
```json
{
  "name": "n8n",
  "version": "2.10.0",
  "description": "n8n Workflow Automation Tool",
  "main": "dist/index",
  "types": "dist/index.d.ts",
  "scripts": {
    "clean": "rimraf dist .turbo",
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json && pnpm run build:data",
    "build:data": "node scripts/build.mjs",
    "buildAndDev": "pnpm run build && pnpm run dev",
    "dev": "concurrently -k -n \"TypeScript,Node\" -c \"yellow.bold,cyan.bold\" \"npm run watch\" \"nodemon --delay 1\"",
    "dev:worker": "concurrently -k -n \"TypeScript,Node\" -c \"yellow.bold,cyan.bold\" \"npm run watch\" \"nodemon worker\"",
    "dev:webhook": "concurrently -k -n \"TypeScript,Node\" -c \"yellow.bold,cyan.bold\" \"npm run watch\" \"nodemon webhook\"",
    "format": "biome format --write .",
    "format:check": "biome ci .",
    "lint": "eslint . --quiet",
    "lint:fix": "eslint . --fix",
    "start": "node ../../scripts/os-normalize.mjs --dir bin n8n",
    "test": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest",
    "test:unit": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --config=jest.config.unit.js",
    "test:integration": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --config=jest.config.integration.js",
    "test:dev": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --watch",
    "test:sqlite": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --config=jest.config.integration.js --no-coverage",
    "test:sqlite:migrations": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --config=jest.config.migration.js --no-coverage",
    "test:sqlite:migrations:tc": "N8N_LOG_LEVEL=silent DB_SQLITE_POOL_SIZE=4 DB_TYPE=sqlite jest --config=jest.config.migration.testcontainers.js --no-coverage",
    "test:postgres": "N8N_LOG_LEVEL=silent DB_TYPE=postgresdb DB_POSTGRESDB_SCHEMA=alt_schema DB_TABLE_PREFIX=test_ jest --config=jest.config.integration.js --no-coverage",
    "test:postgres:migrations": "N8N_LOG_LEVEL=silent DB_TYPE=postgresdb DB_POSTGRESDB_SCHEMA=alt_schema DB_TABLE_PREFIX=test_ jest --config=jest.config.migration.js --no-coverage",
    "test:postgres:migrations:tc": "N8N_LOG_LEVEL=silent DB_TYPE=postgresdb DB_POSTGRESDB_SCHEMA=alt_schema DB_TABLE_PREFIX=test_ jest --config=jest.config.migration.testcontainers.js --no-coverage",
    "test:postgres:tc": "N8N_LOG_LEVEL=silent jest --config=jest.config.integration.testcontainers.js --no-coverage",
    "test:postgres:integration:tc": "N8N_LOG_LEVEL=silent jest --config=jest.config.integration.testcontainers.js --no-coverage --testPathIgnorePatterns=/test/migration/",
    "test:mariadb": "echo true",
    "test:win": "set N8N_LOG_LEVEL=silent&& set DB_SQLITE_POOL_SIZE=4&& set DB_TYPE=sqlite&& jest",
    "test:dev:win": "set N8N_LOG_LEVEL=silent&& set DB_SQLITE_POOL_SIZE=4&& set DB_TYPE=sqlite&& jest --watch",
    "test:sqlite:win": "set N8N_LOG_LEVEL=silent&& set DB_SQLITE_POOL_SIZE=4&& set DB_TYPE=sqlite&& jest --config=jest.config.integration.js",
    "test:postgres:win": "set N8N_LOG_LEVEL=silent&& set DB_TYPE=postgresdb&& set DB_POSTGRESDB_SCHEMA=alt_schema&& set DB_TABLE_PREFIX=test_&& jest --config=jest.config.integration.js --no-coverage",
    "test:mariadb:win": "echo true",
    "watch": "tsc-watch -p tsconfig.build.json --onCompilationComplete \"tsc-alias -p tsconfig.build.json\""
  },
  "bin": {
    "n8n": "./bin/n8n"
  },
  "keywords": [
    "automate",
    "automation",
    "IaaS",
    "iPaaS",
    "n8n",
    "workflow"
  ],
  "engines": {
    "node": ">=22.16"
  },
  "files": [
    "bin",
    "templates",
    "dist"
  ],
  "devDependencies": {
    "@n8n/backend-test-utils": "workspace:*",
    "n8n-containers": "workspace:*",
    "@n8n/typescript-config": "workspace:*",
    "@redocly/cli": "^1.28.5",
    "@types/aws4": "^1.5.1",
    "@types/bcryptjs": "^2.4.2",
    "@types/compression": "^1.7.5",
    "@types/convict": "^6.1.1",
    "@types/cookie-parser": "^1.4.8",
    "@types/express": "catalog:",
    "@types/flat": "^5.0.5",
    "@types/formidable": "^3.4.5",
    "@types/json-diff": "^1.0.0",
    "@types/jsonwebtoken": "catalog:",
    "@types/lodash": "catalog:",
    "@types/psl": "^1.1.0",
    "@types/replacestream": "^4.0.1",
    "@types/shelljs": "^0.8.11",
    "@types/sshpk": "^1.17.4",
    "@types/superagent": "^8.1.9",
    "@types/swagger-ui-express": "^4.1.8",
    "@types/syslog-client": "^1.1.2",
    "@types/uuid": "catalog:",
    "@types/validator": "^13.7.0",
    "@types/ws": "^8.18.1",
    "@types/xml2js": "catalog:",
    "@types/yamljs": "^0.2.31",
    "@types/yargs-parser": "21.0.0",
    "@vvo/tzdb": "^6.141.0",
    "concurrently": "^8.2.0",
    "ioredis-mock": "^8.8.1",
    "mjml": "^4.15.3",
    "openapi-types": "^12.1.3",
    "ts-essentials": "^7.0.3"
  },
  "dependencies": {
    "@aws-sdk/client-secrets-manager": "3.808.0",
    "@azure/identity": "catalog:",
    "@azure/keyvault-secrets": "4.8.0",
    "@google-cloud/secret-manager": "5.6.0",
    "@n8n/ai-utilities": "workspace:*",
    "@n8n/ai-workflow-builder": "workspace:*",
    "@n8n/api-types": "workspace:*",
    "@n8n/backend-common": "workspace:*",
    "@n8n/chat-hub": "workspace:*",
    "@n8n/client-oauth2": "workspace:*",
    "@n8n/config": "workspace:*",
    "@n8n/constants": "workspace:*",
    "@n8n/db": "workspace:*",
    "@n8n/decorators": "workspace:*",
    "@n8n/di": "workspace:*",
    "@n8n/errors": "workspace:*",
    "@modelcontextprotocol/sdk": "1.26.0",
    "@n8n/n8n-nodes-langchain": "workspace:*",
    "@n8n/permissions": "workspace:*",
    "@n8n/syslog-client": "workspace:*",
    "@n8n/task-runner": "workspace:*",
    "@n8n/typeorm": "catalog:",
    "@n8n/utils": "workspace:*",
    "@n8n/workflow-sdk": "workspace:*",
    "@n8n_io/ai-assistant-sdk": "catalog:",
    "@n8n_io/license-sdk": "2.25.0",
    "@parcel/watcher": "^2.5.1",
    "@rudderstack/rudder-sdk-node": "3.0.0",
    "@sentry/node": "catalog:sentry",
    "aws4": "1.11.0",
    "axios": "catalog:",
    "bcryptjs": "2.4.3",
    "bull": "4.16.4",
    "cache-manager": "5.2.3",
    "change-case": "4.1.2",
    "class-transformer": "0.5.1",
    "class-validator": "0.14.0",
    "compression": "1.8.1",
    "convict": "6.2.4",
    "cookie-parser": "1.4.7",
    "csrf": "3.1.0",
    "dotenv": "17.2.3",
    "express": "5.1.0",
    "express-handlebars": "8.0.1",
    "express-openapi-validator": "5.5.3",
    "express-prom-bundle": "8.0.0",
    "express-rate-limit": "7.5.0",
    "fast-glob": "catalog:",
    "flat": "5.0.2",
    "flatted": "catalog:",
    "formidable": "3.5.4",
    "handlebars": "4.7.8",
    "helmet": "8.1.0",
    "http-proxy-middleware": "^3.0.5",
    "infisical-node": "1.3.0",
    "ioredis": "5.3.2",
    "isbot": "3.6.13",
    "json-diff": "1.0.6",
    "jsonschema": "1.4.1",
    "jsonwebtoken": "catalog:",
    "ldapts": "4.2.6",
    "lodash": "catalog:",
    "luxon": "catalog:",
    "n8n-core": "workspace:*",
    "n8n-editor-ui": "workspace:*",
    "n8n-nodes-base": "workspace:*",
    "n8n-workflow": "workspace:*",
    "nanoid": "catalog:",
    "nodemailer": "catalog:",
    "oauth-1.0a": "2.2.6",
    "open": "7.4.2",
    "openid-client": "6.5.0",
    "otpauth": "9.1.1",
    "p-cancelable": "2.1.1",
    "p-lazy": "3.1.0",
    "pg": "catalog:",
    "picocolors": "catalog:",
    "pkce-challenge": "5.0.0",
    "posthog-node": "3.2.1",
    "prom-client": "15.1.3",
    "psl": "1.9.0",
    "raw-body": "3.0.0",
    "reflect-metadata": "catalog:",
    "replacestream": "4.0.3",
    "samlify": "2.10.0",
    "semver": "7.5.4",
    "shelljs": "0.8.5",
    "simple-git": "catalog:",
    "source-map-support": "0.5.21",
    "sqlite3": "5.1.7",
    "sshpk": "1.18.0",
    "swagger-ui-express": "5.0.1",
    "undici": "^7.16.0",
    "uuid": "catalog:",
    "validator": "13.15.22",
    "ws": "8.17.1",
    "xml2js": "catalog:",
    "xmllint-wasm": "3.0.1",
    "xss": "catalog:",
    "yamljs": "0.3.0",
    "yargs-parser": "21.1.1",
    "zod": "catalog:"
  }
}

```

### n8n/packages/core/package.json
```json
{
  "name": "n8n-core",
  "version": "2.10.0",
  "description": "Core functionality of n8n",
  "main": "dist/index",
  "types": "dist/index.d.ts",
  "bin": {
    "n8n-copy-static-files": "./bin/copy-static-files",
    "n8n-generate-translations": "./bin/generate-translations",
    "n8n-generate-metadata": "./bin/generate-metadata",
    "n8n-generate-node-defs": "./bin/generate-node-defs"
  },
  "scripts": {
    "clean": "rimraf dist .turbo",
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json",
    "dev": "pnpm watch",
    "format": "biome format --write .",
    "format:check": "biome ci .",
    "lint": "eslint . --quiet",
    "lint:fix": "eslint . --fix",
    "watch": "tsc-watch -p tsconfig.build.json --onCompilationComplete \"tsc-alias -p tsconfig.build.json\"",
    "test": "jest",
    "test:unit": "jest",
    "test:dev": "jest --watch"
  },
  "files": [
    "dist",
    "bin"
  ],
  "devDependencies": {
    "@n8n/errors": "workspace:*",
    "@n8n/typescript-config": "workspace:*",
    "@types/express": "catalog:",
    "@types/jsonwebtoken": "catalog:",
    "@types/lodash": "catalog:",
    "@types/mime-types": "catalog:",
    "@types/proxy-from-env": "^1.0.4",
    "@types/uuid": "catalog:",
    "@types/xml2js": "catalog:"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "3.808.0",
    "@langchain/core": "catalog:",
    "@n8n/backend-common": "workspace:*",
    "@n8n/client-oauth2": "workspace:*",
    "@n8n/config": "workspace:*",
    "@n8n/constants": "workspace:*",
    "@n8n/decorators": "workspace:*",
    "@n8n/di": "workspace:*",
    "@sentry/node": "catalog:sentry",
    "@sentry/node-native": "catalog:sentry",
    "@sentry/profiling-node": "catalog:sentry",
    "axios": "catalog:",
    "callsites": "catalog:",
    "chardet": "2.0.0",
    "cron": "4.4.0",
    "fast-glob": "catalog:",
    "file-type": "16.5.4",
    "form-data": "catalog:",
    "htmlparser2": "^10.0.0",
    "http-proxy-agent": "catalog:",
    "https-proxy-agent": "catalog:",
    "iconv-lite": "catalog:",
    "jsonwebtoken": "catalog:",
    "lodash": "catalog:",
    "luxon": "catalog:",
    "mime-types": "catalog:",
    "@n8n/workflow-sdk": "workspace:*",
    "n8n-workflow": "workspace:*",
    "nanoid": "catalog:",
    "oauth-1.0a": "2.2.6",
    "p-cancelable": "2.1.1",
    "picocolors": "catalog:",
    "pretty-bytes": "5.6.0",
    "proxy-from-env": "^1.1.0",
    "qs": "6.14.2",
    "ssh2": "1.15.0",
    "uuid": "catalog:",
    "winston": "3.14.2",
    "xml2js": "catalog:",
    "zod": "catalog:"
  }
}

```

### n8n/packages/node-dev/package.json
```json
{
  "name": "n8n-node-dev",
  "version": "2.9.0",
  "description": "CLI to simplify n8n credentials/node development",
  "private": true,
  "main": "dist/src/index",
  "types": "dist/src/index.d.ts",
  "oclif": {
    "commands": "./dist/commands",
    "bin": "n8n-node-dev"
  },
  "scripts": {
    "clean": "rimraf dist .turbo",
    "dev": "pnpm watch",
    "build": "tsc --noEmit",
    "build-node-dev": "tsc",
    "format": "biome format --write .",
    "format:check": "biome ci .",
    "lint": "eslint src --quiet",
    "lint:fix": "eslint src --fix",
    "prepack": "echo \"Building project...\" && rm -rf dist && tsc -b",
    "watch": "tsc --watch"
  },
  "bin": {
    "n8n-node-dev": "./bin/n8n-node-dev"
  },
  "keywords": [
    "development",
    "node",
    "helper",
    "n8n"
  ],
  "files": [
    "bin",
    "dist",
    "templates",
    "src/tsconfig-build.json"
  ],
  "devDependencies": {
    "@n8n/typescript-config": "workspace:*",
    "@types/inquirer": "^6.5.0"
  },
  "dependencies": {
    "@n8n/di": "workspace:*",
    "@oclif/core": "4.0.7",
    "change-case": "^4.1.1",
    "fast-glob": "catalog:",
    "inquirer": "^7.0.1",
    "n8n-core": "workspace:*",
    "n8n-workflow": "workspace:*",
    "replace-in-file": "^6.0.0",
    "tmp-promise": "^3.0.3"
  }
}

```

### n8n/packages/nodes-base/package.json
```json
{
  "name": "n8n-nodes-base",
  "version": "2.10.0",
  "description": "Base nodes of n8n",
  "main": "index.js",
  "scripts": {
    "clean": "rimraf dist .turbo",
    "copy-nodes-json": "node scripts/copy-nodes-json.js .",
    "dev": "pnpm watch",
    "typecheck": "tsc --noEmit",
    "build": "tsc --build tsconfig.build.cjs.json && pnpm copy-nodes-json && tsc-alias -p tsconfig.build.cjs.json && pnpm n8n-copy-static-files && pnpm n8n-generate-translations && pnpm n8n-generate-metadata && pnpm n8n-generate-node-defs",
    "format": "biome format --write .",
    "format:check": "biome ci .",
    "lint": "eslint nodes credentials utils test --quiet && node ./scripts/validate-load-options-methods.js && node ./scripts/validate-schema-versions.js",
    "lint:fix": "eslint nodes credentials utils test --fix",
    "watch": "tsc-watch -p tsconfig.build.cjs.json --onCompilationComplete \"pnpm copy-nodes-json && tsc-alias -p tsconfig.build.cjs.json\" --onSuccess \"pnpm n8n-generate-metadata\"",
    "test": "jest",
    "test:dev": "jest --watch",
    "test:integration:skip": "vitest run --config vitest.integration.config.ts"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "credentials": [
      "dist/credentials/ActionNetworkApi.credentials.js",
      "dist/credentials/ActiveCampaignApi.credentials.js",
      "dist/credentials/AcuitySchedulingApi.credentials.js",
      "dist/credentials/AcuitySchedulingOAuth2Api.credentials.js",
      "dist/credentials/AdaloApi.credentials.js",
      "dist/credentials/AffinityApi.credentials.js",
      "dist/credentials/AgileCrmApi.credentials.js",
      "dist/credentials/AirtableApi.credentials.js",
      "dist/credentials/AirtableOAuth2Api.credentials.js",
      "dist/credentials/AirtableTokenApi.credentials.js",
      "dist/credentials/AirtopApi.credentials.js",
      "dist/credentials/AlienVaultApi.credentials.js",
      "dist/credentials/Amqp.credentials.js",
      "dist/credentials/ApiTemplateIoApi.credentials.js",
      "dist/credentials/AsanaApi.credentials.js",
      "dist/credentials/AsanaOAuth2Api.credentials.js",
      "dist/credentials/Auth0ManagementApi.credentials.js",
      "dist/credentials/AutopilotApi.credentials.js",
      "dist/credentials/Aws.credentials.js",
      "dist/credentials/AwsAssumeRole.credentials.js",
      "dist/credentials/AzureStorageOAuth2Api.credentials.js",
      "dist/credentials/AzureStorageSharedKeyApi.credentials.js",
      "dist/credentials/BambooHrApi.credentials.js",
      "dist/credentials/BannerbearApi.credentials.js",
      "dist/credentials/BaserowApi.credentials.js",
      "dist/credentials/BeeminderApi.credentials.js",
      "dist/credentials/BeeminderOAuth2Api.credentials.js",
      "dist/credentials/BitbucketAccessTokenApi.credentials.js",
      "dist/credentials/BitbucketApi.credentials.js",
      "dist/credentials/BitlyApi.credentials.js",
      "dist/credentials/BitlyOAuth2Api.credentials.js",
      "dist/credentials/BitwardenApi.credentials.js",
      "dist/credentials/BoxOAuth2Api.credentials.js",
      "dist/credentials/BrandfetchApi.credentials.js",
      "dist/credentials/BubbleApi.credentials.js",
      "dist/credentials/CalApi.credentials.js",
      "dist/credentials/CalendlyApi.credentials.js",
      "dist/credentials/CalendlyOAuth2Api.credentials.js",
      "dist/credentials/CarbonBlackApi.credentials.js",
      "dist/credentials/ChargebeeApi.credentials.js",
      "dist/credentials/CircleCiApi.credentials.js",
      "dist/credentials/CiscoMerakiApi.credentials.js",
      "dist/credentials/CiscoSecureEndpointApi.credentials.js",
      "dist/credentials/CiscoWebexOAuth2Api.credentials.js",
      "dist/credentials/CiscoUmbrellaApi.credentials.js",
      "dist/credentials/CloudflareApi.credentials.js",
      "dist/credentials/ClearbitApi.credentials.js",
      "dist/credentials/ClickUpApi.credentials.js",
      "dist/credentials/ClickUpOAuth2Api.credentials.js",
      "dist/credentials/ClockifyApi.credentials.js",
      "dist/credentials/CockpitApi.credentials.js",
      "dist/credentials/CodaApi.credentials.js",
      "dist/credentials/ContentfulApi.credentials.js",
      "dist/credentials/ConvertApi.credentials.js",
      "dist/credentials/ConvertKitApi.credentials.js",
      "dist/credentials/CopperApi.credentials.js",
      "dist/credentials/CortexApi.credentials.js",
      "dist/credentials/CrateDb.credentials.js",
      "dist/credentials/CrowdStrikeOAuth2Api.credentials.js",
      "dist/credentials/Crypto.credentials.js",
      "dist/credentials/CurrentsApi.credentials.js",
      "dist/credentials/CustomerIoApi.credentials.js",
      "dist/credentials/DatadogApi.credentials.js",
      "dist/credentials/DeepLApi.credentials.js",
      "dist/credentials/DemioApi.credentials.js",
      "dist/credentials/DfirIrisApi.credentials.js",
      "dist/credentials/DhlApi.credentials.js",
      "dist/credentials/DiscordBotApi.credentials.js",
      "dist/credentials/DiscordOAuth2Api.credentials.js",
      "dist/credentials/DiscordWebhookApi.credentials.js",
      "dist/credentials/DiscourseApi.credentials.js",
      "dist/credentials/DisqusApi.credentials.js",
      "dist/credentials/DriftApi.credentials.js",
      "dist/credentials/DriftOAuth2Api.credentials.js",
      "dist/credentials/DropboxApi.credentials.js",
      "dist/credentials/DropboxOAuth2Api.credentials.js",
      "dist/credentials/DropcontactApi.credentials.js",
      "dist/credentials/DynatraceApi.credentials.js",
      "dist/credentials/EgoiApi.credentials.js",
      "dist/credentials/ElasticsearchApi.credentials.js",
      "dist/credentials/ElasticSecurityApi.credentials.js",
      "dist/credentials/EmeliaApi.credentials.js",
      "dist/credentials/ERPNextApi.credentials.js",
      "dist/credentials/EventbriteApi.credentials.js",
      "dist/credentials/EventbriteOAuth2Api.credentials.js",
      "dist/credentials/F5BigIpApi.credentials.js",
      "dist/credentials/FacebookGraphApi.credentials.js",
      "dist/credentials/FacebookGraphAppApi.credentials.js",
      "dist/credentials/FacebookLeadAdsOAuth2Api.credentials.js",
      "dist/credentials/FigmaApi.credentials.js",
      "dist/credentials/FileMaker.credentials.js",
      "dist/credentials/FilescanApi.credentials.js",
      "dist/credentials/FlowApi.credentials.js",
      "dist/credentials/FormIoApi.credentials.js",
      "dist/credentials/FormstackApi.credentials.js",
      "dist/credentials/FormstackOAuth2Api.credentials.js",
      "dist/credentials/FortiGateApi.credentials.js",
      "dist/credentials/FreshdeskApi.credentials.js",
      "dist/credentials/FreshserviceApi.credentials.js",
      "dist/credentials/FreshworksCrmApi.credentials.js",
      "dist/credentials/Ftp.credentials.js",
      "dist/credentials/GetResponseApi.credentials.js",
      "dist/credentials/GetResponseOAuth2Api.credentials.js",
      "dist/credentials/GhostAdminApi.credentials.js",
      "dist/credentials/GhostContentApi.credentials.js",
      "dist/credentials/GithubApi.credentials.js",
      "dist/credentials/GithubOAuth2Api.credentials.js",
      "dist/credentials/GitlabApi.credentials.js",
      "dist/credentials/GitlabOAuth2Api.credentials.js",
      "dist/credentials/GitPassword.credentials.js",
      "dist/credentials/GmailOAuth2Api.credentials.js",
      "dist/credentials/GongApi.credentials.js",
      "dist/credentials/GongOAuth2Api.credentials.js",
      "dist/credentials/GoogleAdsOAuth2Api.credentials.js",
      "dist/credentials/GoogleAnalyticsOAuth2Api.credentials.js",
      "dist/credentials/GoogleApi.credentials.js",
      "dist/credentials/GoogleBigQueryOAuth2Api.credentials.js",
      "dist/credentials/GoogleBooksOAuth2Api.credentials.js",
      "dist/credentials/GoogleCalendarOAuth2Api.credentials.js",
      "dist/credentials/GoogleChatOAuth2Api.credentials.js",
      "dist/credentials/GoogleCloudNaturalLanguageOAuth2Api.credentials.js",
      "dist/credentials/GoogleCloudStorageOAuth2Api.credentials.js",
      "dist/credentials/GoogleContactsOAuth2Api.credentials.js",
      "dist/credentials/GoogleDocsOAuth2Api.credentials.js",
      "dist/credentials/GoogleDriveOAuth2Api.credentials.js",
      "dist/credentials/GoogleFirebaseCloudFirestoreOAuth2Api.credentials.js",
      "dist/credentials/GoogleFirebaseRealtimeDatabaseOAuth2Api.credentials.js",
      "dist/credentials/GoogleBusinessProfileOAuth2Api.credentials.js",
      "dist/credentials/GoogleOAuth2Api.credentials.js",
      "dist/credentials/GooglePerspectiveOAuth2Api.credentials.js",
      "dist/credentials/GoogleSheetsOAuth2Api.credentials.js",
      "dist/credentials/GoogleSheetsTriggerOAuth2Api.credentials.js",
      "dist/credentials/GoogleSlidesOAuth2Api.credentials.js",
      "dist/credentials/GoogleTasksOAuth2Api.credentials.js",
      "dist/credentials/GoogleTranslateOAuth2Api.credentials.js",
      "dist/credentials/GotifyApi.credentials.js",
      "dist/credentials/GoToWebinarOAuth2Api.credentials.js",
      "dist/credentials/GristApi.credentials.js",
      "dist/credentials/GrafanaApi.credentials.js",
      "dist/credentials/GSuiteAdminOAuth2Api.credentials.js",
      "dist/credentials/GumroadApi.credentials.js",
      "dist/credentials/HaloPSAApi.credentials.js",
      "dist/credentials/HarvestApi.credentials.js",
      "dist/credentials/HarvestOAuth2Api.credentials.js",
      "dist/credentials/HelpScoutOAuth2Api.credentials.js",
      "dist/credentials/HighLevelApi.credentials.js",
      "dist/credentials/HighLevelOAuth2Api.credentials.js",
      "dist/credentials/HomeAssistantApi.credentials.js",
      "dist/credentials/HttpBasicAuth.credentials.js",
      "dist/credentials/HttpBearerAuth.credentials.js",
      "dist/credentials/HttpDigestAuth.credentials.js",
      "dist/credentials/HttpHeaderAuth.credentials.js",
      "dist/credentials/HttpMultipleHeadersAuth.credentials.js",
      "dist/credentials/HttpCustomAuth.credentials.js",
      "dist/credentials/HttpQueryAuth.credentials.js",
      "dist/credentials/HttpSslAuth.credentials.js",
      "dist/credentials/HubspotApi.credentials.js",
      "dist/credentials/HubspotAppToken.credentials.js",
      "dist/credentials/HubspotDeveloperApi.credentials.js",
      "dist/credentials/HubspotOAuth2Api.credentials.js",
      "dist/credentials/HumanticAiApi.credentials.js",
      "dist/credentials/HunterApi.credentials.js",
      "dist/credentials/HybridAnalysisApi.credentials.js",
      "dist/credentials/Imap.credentials.js",
      "dist/credentials/ImpervaWafApi.credentials.js",
      "dist/credentials/IntercomApi.credentials.js",
      "dist/credentials/InvoiceNinjaApi.credentials.js",
      "dist/credentials/IterableApi.credentials.js",
      "dist/credentials/JenkinsApi.credentials.js",
      "dist/credentials/JinaAiApi.credentials.js",
      "dist/credentials/JiraSoftwareCloudApi.credentials.js",
      "dist/credentials/JiraSoftwareServerApi.credentials.js",
      "dist/credentials/JiraSoftwareServerPatApi.credentials.js",
      "dist/credentials/JotFormApi.credentials.js",
      "dist/credentials/JwtAuth.credentials.js",
      "dist/credentials/Kafka.credentials.js",
      "dist/credentials/KeapOAuth2Api.credentials.js",
      "dist/credentials/KibanaApi.credentials.js",
      "dist/credentials/KoBoToolboxApi.credentials.js",
      "dist/credentials/Ldap.credentials.js",
      "dist/credentials/LemlistApi.credentials.js",
      "dist/credentials/LinearApi.credentials.js",
      "dist/credentials/LinearOAuth2Api.credentials.js",
      "dist/credentials/LineNotifyOAuth2Api.credentials.js",
      "dist/credentials/LingvaNexApi.credentials.js",
      "dist/credentials/LinkedInCommunityManagementOAuth2Api.credentials.js",
      "dist/credentials/LinkedInOAuth2Api.credentials.js",
      "dist/credentials/LoneScaleApi.credentials.js",
      "dist/credentials/Magento2Api.credentials.js",
      "dist/credentials/MailcheckApi.credentials.js",
      "dist/credentials/MailchimpApi.credentials.js",
      "dist/credentials/MailchimpOAuth2Api.credentials.js",
      "dist/credentials/MailerLiteApi.credentials.js",
      "dist/credentials/MailgunApi.credentials.js",
      "dist/credentials/MailjetEmailApi.credentials.js",
      "dist/credentials/MailjetSmsApi.credentials.js",
      "dist/credentials/MalcoreApi.credentials.js",
      "dist/credentials/MandrillApi.credentials.js",
      "dist/credentials/MarketstackApi.credentials.js",
      "dist/credentials/MatrixApi.credentials.js",
      "dist/credentials/MattermostApi.credentials.js",
      "dist/credentials/MauticApi.credentials.js",
      "dist/credentials/MauticOAuth2Api.credentials.js",
      "dist/credentials/MediumApi.credentials.js",
      "dist/credentials/MediumOAuth2Api.credentials.js",
      "dist/credentials/MetabaseApi.credentials.js",
      "dist/credentials/MessageBirdApi.credentials.js",
      "dist/credentials/MetabaseApi.credentials.js",
      "dist/credentials/MicrosoftAzureCosmosDbSharedKeyApi.credentials.js",
      "dist/credentials/MicrosoftAzureMonitorOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftDynamicsOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftEntraOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftExcelOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftGraphSecurityOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftOneDriveOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftOutlookOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftSharePointOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftSql.credentials.js",
      "dist/credentials/MicrosoftTeamsOAuth2Api.credentials.js",
      "dist/credentials/MicrosoftToDoOAuth2Api.credentials.js",
      "dist/credentials/MindeeInvoiceApi.credentials.js",
      "dist/credentials/MindeeReceiptApi.credentials.js",
      "dist/credentials/MiroOAuth2Api.credentials.js",
      "dist/credentials/MispApi.credentials.js",
      "dist/credentials/MistApi.credentials.js",
      "dist/credentials/MoceanApi.credentials.js",
      "dist/credentials/MondayComApi.credentials.js",
      "dist/credentials/MondayComOAuth2Api.credentials.js",
      "dist/credentials/MongoDb.credentials.js",
      "dist/credentials/MonicaCrmApi.credentials.js",
      "dist/credentials/Mqtt.credentials.js",
      "dist/credentials/Msg91Api.credentials.js",
      "dist/credentials/MySql.credentials.js",
      "dist/credentials/N8nApi.credentials.js",
      "dist/credentials/NasaApi.credentials.js",
      "dist/credentials/NetlifyApi.credentials.js",
      "dist/credentials/NetscalerAdcApi.credentials.js",
      "dist/credentials/NextCloudApi.credentials.js",
      "dist/credentials/NextCloudOAuth2Api.credentials.js",
      "dist/credentials/NocoDb.credentials.js",
      "dist/credentials/NocoDbApiToken.credentials.js",
      "dist/credentials/NotionApi.credentials.js",
      "dist/credentials/NotionOAuth2Api.credentials.js",
      "dist/credentials/NpmApi.credentials.js",
      "dist/credentials/OAuth1Api.credentials.js",
      "dist/credentials/OAuth2Api.credentials.js",
      "dist/credentials/OdooApi.credentials.js",
      "dist/credentials/OktaApi.credentials.js",
      "dist/credentials/OneSimpleApi.credentials.js",
      "dist/credentials/OnfleetApi.credentials.js",
      "dist/credentials/OpenAiApi.credentials.js",
      "dist/credentials/OpenCTIApi.credentials.js",
      "dist/credentials/OpenWeatherMapApi.credentials.js",
      "dist/credentials/OracleDBApi.credentials.js",
      "dist/credentials/OrbitApi.credentials.js",
      "dist/credentials/OuraApi.credentials.js",
      "dist/credentials/PaddleApi.credentials.js",
      "dist/credentials/PagerDutyApi.credentials.js",
      "dist/credentials/PagerDutyOAuth2Api.credentials.js",
      "dist/credentials/PayPalApi.credentials.js",
      "dist/credentials/PeekalinkApi.credentials.js",
      "dist/credentials/PerplexityApi.credentials.js",
      "dist/credentials/PhantombusterApi.credentials.js",
      "dist/credentials/PhilipsHueOAuth2Api.credentials.js",
      "dist/credentials/PipedriveApi.credentials.js",
      "dist/credentials/PipedriveOAuth2Api.credentials.js",
      "dist/credentials/PlivoApi.credentials.js",
      "dist/credentials/Postgres.credentials.js",
      "dist/credentials/PostHogApi.credentials.js",
      "dist/credentials/PostmarkApi.credentials.js",
      "dist/credentials/ProfitWellApi.credentials.js",
      "dist/credentials/PushbulletOAuth2Api.credentials.js",
      "dist/credentials/PushcutApi.credentials.js",
      "dist/credentials/PushoverApi.credentials.js",
      "dist/credentials/QRadarApi.credentials.js",
      "dist/credentials/QualysApi.credentials.js",
      "dist/credentials/QuestDb.credentials.js",
      "dist/credentials/QuickBaseApi.credentials.js",
      "dist/credentials/QuickBooksOAuth2Api.credentials.js",
      "dist/credentials/RabbitMQ.credentials.js",
      "dist/credentials/RaindropOAuth2Api.credentials.js",
      "dist/credentials/Rapid7InsightVmApi.credentials.js",
      "dist/credentials/RecordedFutureApi.credentials.js",
      "dist/credentials/RedditOAuth2Api.credentials.js",
      "dist/credentials/Redis.credentials.js",
      "dist/credentials/RocketchatApi.credentials.js",
      "dist/credentials/RundeckApi.credentials.js",
      "dist/credentials/S3.credentials.js",
      "dist/credentials/SalesforceJwtApi.credentials.js",
      "dist/credentials/SalesforceOAuth2Api.credentials.js",
      "dist/credentials/SalesmateApi.credentials.js",
      "dist/credentials/SeaTableApi.credentials.js",
      "dist/credentials/SecurityScorecardApi.credentials.js",
      "dist/credentials/SegmentApi.credentials.js",
      "dist/credentials/SekoiaApi.credentials.js",
      "dist/credentials/SendGridApi.credentials.js",
      "dist/credentials/BrevoApi.credentials.js",
      "dist/credentials/SendyApi.credentials.js",
      "dist/credentials/SentryIoApi.credentials.js",
      "dist/credentials/SentryIoOAuth2Api.credentials.js",
      "dist/credentials/SentryIoServerApi.credentials.js",
      "dist/credentials/ServiceNowOAuth2Api.credentials.js",
      "dist/credentials/ServiceNowBasicApi.credentials.js",
      "dist/credentials/Sftp.credentials.js",
      "dist/credentials/ShopifyApi.credentials.js",
      "dist/credentials/ShopifyAccessTokenApi.credentials.js",
      "dist/credentials/ShopifyOAuth2Api.credentials.js",
      "dist/credentials/Signl4Api.credentials.js",
      "dist/credentials/SlackApi.credentials.js",
      "dist/credentials/SlackOAuth2Api.credentials.js",
      "dist/credentials/Sms77Api.credentials.js",
      "dist/credentials/Smtp.credentials.js",
      "dist/credentials/Snowflake.credentials.js",
      "dist/credentials/SolarWindsIpamApi.credentials.js",
      "dist/credentials/SolarWindsObservabilityApi.credentials.js",
      "dist/credentials/SplunkApi.credentials.js",
      "dist/credentials/SpotifyOAuth2Api.credentials.js",
      "dist/credentials/ShufflerApi.credentials.js",
      "dist/credentials/SshPassword.credentials.js",
      "dist/credentials/SshPrivateKey.credentials.js",
      "dist/credentials/StackbyApi.credentials.js",
      "dist/credentials/StoryblokContentApi.credentials.js",
      "dist/credentials/StoryblokManagementApi.credentials.js",
      "dist/credentials/StrapiApi.credentials.js",
      "dist/credentials/StrapiTokenApi.credentials.js",
      "dist/credentials/StravaOAuth2Api.credentials.js",
      "dist/credentials/StripeApi.credentials.js",
      "dist/credentials/SupabaseApi.credentials.js",
      "dist/credentials/SurveyMonkeyApi.credentials.js",
      "dist/credentials/SurveyMonkeyOAuth2Api.credentials.js",
      "dist/credentials/SyncroMspApi.credentials.js",
      "dist/credentials/SysdigApi.credentials.js",
      "dist/credentials/TaigaApi.credentials.js",
      "dist/credentials/TapfiliateApi.credentials.js",
      "dist/credentials/TelegramApi.credentials.js",
      "dist/credentials/TheHiveProjectApi.credentials.js",
      "dist/credentials/TheHiveApi.credentials.js",
      "dist/credentials/TimescaleDb.credentials.js",
      "dist/credentials/TodoistApi.credentials.js",
      "dist/credentials/TodoistOAuth2Api.credentials.js",
      "dist/credentials/TogglApi.credentials.js",
      "dist/credentials/TotpApi.credentials.js",
      "dist/credentials/TravisCiApi.credentials.js",
      "dist/credentials/TrellixEpoApi.credentials.js",
      "dist/credentials/TrelloApi.credentials.js",
      "dist/credentials/TwakeCloudApi.credentials.js",
      "dist/credentials/TwakeServerApi.credentials.js",
      "dist/credentials/TwilioApi.credentials.js",
      "dist/credentials/TwistOAuth2Api.credentials.js",
      "dist/credentials/TwitterOAuth1Api.credentials.js",
      "dist/credentials/TwitterOAuth2Api.credentials.js",
      "dist/credentials/TypeformApi.credentials.js",
      "dist/credentials/TypeformOAuth2Api.credentials.js",
      "dist/credentials/UnleashedSoftwareApi.credentials.js",
      "dist/credentials/UpleadApi.credentials.js",
      "dist/credentials/UProcApi.credentials.js",
      "dist/credentials/UptimeRobotApi.credentials.js",
      "dist/credentials/UrlScanIoApi.credentials.js",
      "dist/credentials/VeroApi.credentials.js",
      "dist/credentials/VerticaApi.credentials.js",
      "dist/credentials/VirusTotalApi.credentials.js",
      "dist/credentials/VonageApi.credentials.js",
      "dist/credentials/VenafiTlsProtectCloudApi.credentials.js",
      "dist/credentials/VenafiTlsProtectDatacenterApi.credentials.js",
      "dist/credentials/WebflowApi.credentials.js",
      "dist/credentials/WebflowOAuth2Api.credentials.js",
      "dist/credentials/WekanApi.credentials.js",
      "dist/credentials/WhatsAppApi.credentials.js",
      "dist/credentials/WhatsAppTriggerApi.credentials.js",
      "dist/credentials/WiseApi.credentials.js",
      "dist/credentials/WooCommerceApi.credentials.js",
      "dist/credentials/WordpressApi.credentials.js",
      "dist/credentials/WorkableApi.credentials.js",
      "dist/credentials/WufooApi.credentials.js",
      "dist/credentials/XeroOAuth2Api.credentials.js",
      "dist/credentials/YourlsApi.credentials.js",
      "dist/credentials/YouTubeOAuth2Api.credentials.js",
      "dist/credentials/ZabbixApi.credentials.js",
      "dist/credentials/ZammadBasicAuthApi.credentials.js",
      "dist/credentials/ZammadTokenAuthApi.credentials.js",
      "dist/credentials/ZendeskApi.credentials.js",
      "dist/credentials/ZendeskOAuth2Api.credentials.js",
      "dist/credentials/ZohoOAuth2Api.credentials.js",
      "dist/credentials/ZoomApi.credentials.js",
      "dist/credentials/ZoomOAuth2Api.credentials.js",
      "dist/credentials/ZscalerZiaApi.credentials.js",
      "dist/credentials/ZulipApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/ActionNetwork/ActionNetwork.node.js",
      "dist/nodes/ActiveCampaign/ActiveCampaign.node.js",
      "dist/nodes/ActiveCampaign/ActiveCampaignTrigger.node.js",
      "dist/nodes/AcuityScheduling/AcuitySchedulingTrigger.node.js",
      "dist/nodes/Adalo/Adalo.node.js",
      "dist/nodes/Affinity/Affinity.node.js",
      "dist/nodes/Affinity/AffinityTrigger.node.js",
      "dist/nodes/AgileCrm/AgileCrm.node.js",
      "dist/nodes/Airtable/Airtable.node.js",
      "dist/nodes/Airtable/AirtableTrigger.node.js",
      "dist/nodes/Airtop/Airtop.node.js",
      "dist/nodes/AiTransform/AiTransform.node.js",
      "dist/nodes/Amqp/Amqp.node.js",
      "dist/nodes/Amqp/AmqpTrigger.node.js",
      "dist/nodes/ApiTemplateIo/ApiTemplateIo.node.js",
      "dist/nodes/Asana/Asana.node.js",
      "dist/nodes/Asana/AsanaTrigger.node.js",
      "dist/nodes/Autopilot/Autopilot.node.js",
      "dist/nodes/Autopilot/AutopilotTrigger.node.js",
      "dist/nodes/Aws/AwsLambda.node.js",
      "dist/nodes/Aws/AwsSns.node.js",
      "dist/nodes/Aws/AwsSnsTrigger.node.js",
      "dist/nodes/Aws/CertificateManager/AwsCertificateManager.node.js",
      "dist/nodes/Aws/Cognito/AwsCognito.node.js",
      "dist/nodes/Aws/Comprehend/AwsComprehend.node.js",
      "dist/nodes/Aws/DynamoDB/AwsDynamoDB.node.js",
      "dist/nodes/Aws/ELB/AwsElb.node.js",
      "dist/nodes/Aws/IAM/AwsIam.node.js",
      "dist/nodes/Aws/Rekognition/AwsRekognition.node.js",
      "dist/nodes/Aws/S3/AwsS3.node.js",
      "dist/nodes/Aws/SES/AwsSes.node.js",
      "dist/nodes/Aws/SQS/AwsSqs.node.js",
      "dist/nodes/Aws/Textract/AwsTextract.node.js",
      "dist/nodes/Aws/Transcribe/AwsTranscribe.node.js",
      "dist/nodes/BambooHr/BambooHr.node.js",
      "dist/nodes/Bannerbear/Bannerbear.node.js",
      "dist/nodes/Baserow/Baserow.node.js",
      "dist/nodes/Beeminder/Beeminder.node.js",
      "dist/nodes/Bitbucket/BitbucketTrigger.node.js",
      "dist/nodes/Bitly/Bitly.node.js",
      "dist/nodes/Bitwarden/Bitwarden.node.js",
      "dist/nodes/Box/Box.node.js",
      "dist/nodes/Box/BoxTrigger.node.js",
      "dist/nodes/Brandfetch/Brandfetch.node.js",
      "dist/nodes/Bubble/Bubble.node.js",
      "dist/nodes/Cal/CalTrigger.node.js",
      "dist/nodes/Calendly/CalendlyTrigger.node.js",
      "dist/nodes/Chargebee/Chargebee.node.js",
      "dist/nodes/Chargebee/ChargebeeTrigger.node.js",
      "dist/nodes/CircleCi/CircleCi.node.js",
      "dist/nodes/Cisco/Webex/CiscoWebex.node.js",
      "dist/nodes/Cisco/Webex/CiscoWebexTrigger.node.js",
      "dist/nodes/Cloudflare/Cloudflare.node.js",
      "dist/nodes/Clearbit/Clearbit.node.js",
      "dist/nodes/ClickUp/ClickUp.node.js",
      "dist/nodes/ClickUp/ClickUpTrigger.node.js",
      "dist/nodes/Clockify/Clockify.node.js",
      "dist/nodes/Clockify/ClockifyTrigger.node.js",
      "dist/nodes/Cockpit/Cockpit.node.js",
      "dist/nodes/Coda/Coda.node.js",
      "dist/nodes/Code/Code.node.js",
      "dist/nodes/CoinGecko/CoinGecko.node.js",
      "dist/nodes/CompareDatasets/CompareDatasets.node.js",
      "dist/nodes/Compression/Compression.node.js",
      "dist/nodes/Contentful/Contentful.node.js",
      "dist/nodes/ConvertKit/ConvertKit.node.js",
      "dist/nodes/ConvertKit/ConvertKitTrigger.node.js",
      "dist/nodes/Copper/Copper.node.js",
      "dist/nodes/Copper/CopperTrigger.node.js",
      "dist/nodes/Cortex/Cortex.node.js",
      "dist/nodes/CrateDb/CrateDb.node.js",
      "dist/nodes/Cron/Cron.node.js",
      "dist/nodes/Crypto/Crypto.node.js",
      "dist/nodes/Currents/Currents.node.js",
      "dist/nodes/Currents/CurrentsTrigger.node.js",
      "dist/nodes/CustomerIo/CustomerIo.node.js",
      "dist/nodes/CustomerIo/CustomerIoTrigger.node.js",
      "dist/nodes/DataTable/DataTable.node.js",
      "dist/nodes/DateTime/DateTime.node.js",
      "dist/nodes/DebugHelper/DebugHelper.node.js",
      "dist/nodes/DeepL/DeepL.node.js",
      "dist/nodes/Demio/Demio.node.js",
      "dist/nodes/Dhl/Dhl.node.js",
      "dist/nodes/Discord/Discord.node.js",
      "dist/nodes/Discourse/Discourse.node.js",
      "dist/nodes/Disqus/Disqus.node.js",
      "dist/nodes/Drift/Drift.node.js",
      "dist/nodes/Dropbox/Dropbox.node.js",
      "dist/nodes/Dropcontact/Dropcontact.node.js",
      "dist/nodes/EditImage/EditImage.node.js",
      "dist/nodes/E2eTest/E2eTest.node.js",
      "dist/nodes/Egoi/Egoi.node.js",
      "dist/nodes/Elastic/Elasticsearch/Elasticsearch.node.js",
      "dist/nodes/Elastic/ElasticSecurity/ElasticSecurity.node.js",
      "dist/nodes/EmailReadImap/EmailReadImap.node.js",
      "dist/nodes/EmailSend/EmailSend.node.js",
      "dist/nodes/Emelia/Emelia.node.js",
      "dist/nodes/Emelia/EmeliaTrigger.node.js",
      "dist/nodes/ERPNext/ERPNext.node.js",
      "dist/nodes/ErrorTrigger/ErrorTrigger.node.js",
      "dist/nodes/Evaluation/EvaluationTrigger/EvaluationTrigger.node.ee.js",
      "dist/nodes/Evaluation/Evaluation/Evaluation.node.ee.js",
      "dist/nodes/Eventbrite/EventbriteTrigger.node.js",
      "dist/nodes/ExecuteCommand/ExecuteCommand.node.js",
      "dist/nodes/ExecuteWorkflow/ExecuteWorkflow/ExecuteWorkflow.node.js",
      "dist/nodes/ExecuteWorkflow/ExecuteWorkflowTrigger/ExecuteWorkflowTrigger.node.js",
      "dist/nodes/ExecutionData/ExecutionData.node.js",
      "dist/nodes/Facebook/FacebookGraphApi.node.js",
      "dist/nodes/Facebook/FacebookTrigger.node.js",
      "dist/nodes/FacebookLeadAds/FacebookLeadAdsTrigger.node.js",
      "dist/nodes/Figma/FigmaTrigger.node.js",
      "dist/nodes/FileMaker/FileMaker.node.js",
      "dist/nodes/Files/ReadWriteFile/ReadWriteFile.node.js",
      "dist/nodes/Files/ConvertToFile/ConvertToFile.node.js",
      "dist/nodes/Files/ExtractFromFile/ExtractFromFile.node.js",
      "dist/nodes/Filter/Filter.node.js",
      "dist/nodes/Flow/Flow.node.js",
      "dist/nodes/Flow/FlowTrigger.node.js",
      "dist/nodes/Form/Form.node.js",
      "dist/nodes/Form/FormTrigger.node.js",
      "dist/nodes/FormIo/FormIoTrigger.node.js",
      "dist/nodes/Formstack/FormstackTrigger.node.js",
      "dist/nodes/Freshdesk/Freshdesk.node.js",
      "dist/nodes/Freshservice/Freshservice.node.js",
      "dist/nodes/FreshworksCrm/FreshworksCrm.node.js",
      "dist/nodes/Ftp/Ftp.node.js",
      "dist/nodes/Function/Function.node.js",
      "dist/nodes/FunctionItem/FunctionItem.node.js",
      "dist/nodes/GetResponse/GetResponse.node.js",
      "dist/nodes/GetResponse/GetResponseTrigger.node.js",
      "dist/nodes/Ghost/Ghost.node.js",
      "dist/nodes/Git/Git.node.js",
      "dist/nodes/Github/Github.node.js",
      "dist/nodes/Github/GithubTrigger.node.js",
      "dist/nodes/Gitlab/Gitlab.node.js",
      "dist/nodes/Gitlab/GitlabTrigger.node.js",
      "dist/nodes/Gong/Gong.node.js",
      "dist/nodes/Google/Ads/GoogleAds.node.js",
      "dist/nodes/Google/Analytics/GoogleAnalytics.node.js",
      "dist/nodes/Google/BigQuery/GoogleBigQuery.node.js",
      "dist/nodes/Google/Books/GoogleBooks.node.js",
      "dist/nodes/Google/Calendar/GoogleCalendar.node.js",
      "dist/nodes/Google/Calendar/GoogleCalendarTrigger.node.js",
      "dist/nodes/Google/Chat/GoogleChat.node.js",
      "dist/nodes/Google/CloudNaturalLanguage/GoogleCloudNaturalLanguage.node.js",
      "dist/nodes/Google/CloudStorage/GoogleCloudStorage.node.js",
      "dist/nodes/Google/Contacts/GoogleContacts.node.js",
      "dist/nodes/Google/Docs/GoogleDocs.node.js",
      "dist/nodes/Google/Drive/GoogleDrive.node.js",
      "dist/nodes/Google/Drive/GoogleDriveTrigger.node.js",
      "dist/nodes/Google/Firebase/CloudFirestore/GoogleFirebaseCloudFirestore.node.js",
      "dist/nodes/Google/Firebase/RealtimeDatabase/GoogleFirebaseRealtimeDatabase.node.js",
      "dist/nodes/Google/Gmail/Gmail.node.js",
      "dist/nodes/Google/Gmail/GmailTrigger.node.js",
      "dist/nodes/Google/GSuiteAdmin/GSuiteAdmin.node.js",
      "dist/nodes/Google/BusinessProfile/GoogleBusinessProfile.node.js",
      "dist/nodes/Google/BusinessProfile/GoogleBusinessProfileTrigger.node.js",
      "dist/nodes/Google/Perspective/GooglePerspective.node.js",
      "dist/nodes/Google/Sheet/GoogleSheets.node.js",
      "dist/nodes/Google/Sheet/GoogleSheetsTrigger.node.js",
      "dist/nodes/Google/Slides/GoogleSlides.node.js",
      "dist/nodes/Google/Task/GoogleTasks.node.js",
      "dist/nodes/Google/Translate/GoogleTranslate.node.js",
      "dist/nodes/Google/YouTube/YouTube.node.js",
      "dist/nodes/Gotify/Gotify.node.js",
      "dist/nodes/GoToWebinar/GoToWebinar.node.js",
      "dist/nodes/Grafana/Grafana.node.js",
      "dist/nodes/GraphQL/GraphQL.node.js",
      "dist/nodes/Grist/Grist.node.js",
      "dist/nodes/Gumroad/GumroadTrigger.node.js",
      "dist/nodes/HackerNews/HackerNews.node.js",
      "dist/nodes/HaloPSA/HaloPSA.node.js",
      "dist/nodes/Harvest/Harvest.node.js",
      "dist/nodes/HelpScout/HelpScout.node.js",
      "dist/nodes/HelpScout/HelpScoutTrigger.node.js",
      "dist/nodes/HighLevel/HighLevel.node.js",
      "dist/nodes/HomeAssistant/HomeAssistant.node.js",
      "dist/nodes/HtmlExtract/HtmlExtract.node.js",
      "dist/nodes/Html/Html.node.js",
      "dist/nodes/HttpRequest/HttpRequest.node.js",
      "dist/nodes/Hubspot/Hubspot.node.js",
      "dist/nodes/Hubspot/HubspotTrigger.node.js",
      "dist/nodes/HumanticAI/HumanticAi.node.js",
      "dist/nodes/Hunter/Hunter.node.js",
      "dist/nodes/ICalendar/ICalendar.node.js",
      "dist/nodes/If/If.node.js",
      "dist/nodes/Intercom/Intercom.node.js",
      "dist/nodes/Interval/Interval.node.js",
      "dist/nodes/InvoiceNinja/InvoiceNinja.node.js",
      "dist/nodes/InvoiceNinja/InvoiceNinjaTrigger.node.js",
      "dist/nodes/ItemLists/ItemLists.node.js",
      "dist/nodes/Iterable/Iterable.node.js",
      "dist/nodes/Jenkins/Jenkins.node.js",
      "dist/nodes/JinaAI/JinaAi.node.js",
      "dist/nodes/Jira/Jira.node.js",
      "dist/nodes/Jira/JiraTrigger.node.js",
      "dist/nodes/JotForm/JotFormTrigger.node.js",
      "dist/nodes/Jwt/Jwt.node.js",
      "dist/nodes/Kafka/Kafka.node.js",
      "dist/nodes/Kafka/KafkaTrigger.node.js",
      "dist/nodes/Keap/Keap.node.js",
      "dist/nodes/Keap/KeapTrigger.node.js",
      "dist/nodes/KoBoToolbox/KoBoToolbox.node.js",
      "dist/nodes/KoBoToolbox/KoBoToolboxTrigger.node.js",
      "dist/nodes/Ldap/Ldap.node.js",
      "dist/nodes/Lemlist/Lemlist.node.js",
      "dist/nodes/Lemlist/LemlistTrigger.node.js",
      "dist/nodes/Line/Line.node.js",
      "dist/nodes/Linear/Linear.node.js",
      "dist/nodes/Linear/LinearTrigger.node.js",
      "dist/nodes/LingvaNex/LingvaNex.node.js",
      "dist/nodes/LinkedIn/LinkedIn.node.js",
      "dist/nodes/LocalFileTrigger/LocalFileTrigger.node.js",
      "dist/nodes/LoneScale/LoneScaleTrigger.node.js",
      "dist/nodes/LoneScale/LoneScale.node.js",
      "dist/nodes/Magento/Magento2.node.js",
      "dist/nodes/Mailcheck/Mailcheck.node.js",
      "dist/nodes/Mailchimp/Mailchimp.node.js",
      "dist/nodes/Mailchimp/MailchimpTrigger.node.js",
      "dist/nodes/MailerLite/MailerLite.node.js",
      "dist/nodes/MailerLite/MailerLiteTrigger.node.js",
      "dist/nodes/Mailgun/Mailgun.node.js",
      "dist/nodes/Mailjet/Mailjet.node.js",
      "dist/nodes/Mailjet/MailjetTrigger.node.js",
      "dist/nodes/Mandrill/Mandrill.node.js",
      "dist/nodes/ManualTrigger/ManualTrigger.node.js",
      "dist/nodes/Markdown/Markdown.node.js",
      "dist/nodes/Marketstack/Marketstack.node.js",
      "dist/nodes/Matrix/Matrix.node.js",
      "dist/nodes/Mattermost/Mattermost.node.js",
      "dist/nodes/Mautic/Mautic.node.js",
      "dist/nodes/Mautic/MauticTrigger.node.js",
      "dist/nodes/Medium/Medium.node.js",
      "dist/nodes/Merge/Merge.node.js",
      "dist/nodes/MessageBird/MessageBird.node.js",
      "dist/nodes/Metabase/Metabase.node.js",
      "dist/nodes/Microsoft/AzureCosmosDb/AzureCosmosDb.node.js",
      "dist/nodes/Microsoft/Dynamics/MicrosoftDynamicsCrm.node.js",
      "dist/nodes/Microsoft/Entra/MicrosoftEntra.node.js",
      "dist/nodes/Microsoft/Excel/MicrosoftExcel.node.js",
      "dist/nodes/Microsoft/GraphSecurity/MicrosoftGraphSecurity.node.js",
      "dist/nodes/Microsoft/OneDrive/MicrosoftOneDrive.node.js",
      "dist/nodes/Microsoft/OneDrive/MicrosoftOneDriveTrigger.node.js",
      "dist/nodes/Microsoft/Outlook/MicrosoftOutlook.node.js",
      "dist/nodes/Microsoft/Outlook/MicrosoftOutlookTrigger.node.js",
      "dist/nodes/Microsoft/SharePoint/MicrosoftSharePoint.node.js",
      "dist/nodes/Microsoft/Sql/MicrosoftSql.node.js",
      "dist/nodes/Microsoft/Storage/AzureStorage.node.js",
      "dist/nodes/Microsoft/Teams/MicrosoftTeams.node.js",
      "dist/nodes/Microsoft/Teams/MicrosoftTeamsTrigger.node.js",
      "dist/nodes/Microsoft/ToDo/MicrosoftToDo.node.js",
      "dist/nodes/Mindee/Mindee.node.js",
      "dist/nodes/Misp/Misp.node.js",
      "dist/nodes/MistralAI/MistralAi.node.js",
      "dist/nodes/Mocean/Mocean.node.js",
      "dist/nodes/MondayCom/MondayCom.node.js",
      "dist/nodes/MongoDb/MongoDb.node.js",
      "dist/nodes/MonicaCrm/MonicaCrm.node.js",
      "dist/nodes/MoveBinaryData/MoveBinaryData.node.js",
      "dist/nodes/MQTT/Mqtt.node.js",
      "dist/nodes/MQTT/MqttTrigger.node.js",
      "dist/nodes/Msg91/Msg91.node.js",
      "dist/nodes/MySql/MySql.node.js",
      "dist/nodes/N8n/N8n.node.js",
      "dist/nodes/N8nTrainingCustomerDatastore/N8nTrainingCustomerDatastore.node.js",
      "dist/nodes/N8nTrainingCustomerMessenger/N8nTrainingCustomerMessenger.node.js",
      "dist/nodes/N8nTrigger/N8nTrigger.node.js",
      "dist/nodes/Nasa/Nasa.node.js",
      "dist/nodes/Netlify/Netlify.node.js",
      "dist/nodes/Netlify/NetlifyTrigger.node.js",
      "dist/nodes/NextCloud/NextCloud.node.js",
      "dist/nodes/NocoDB/NocoDB.node.js",
      "dist/nodes/Brevo/Brevo.node.js",
      "dist/nodes/Brevo/BrevoTrigger.node.js",
      "dist/nodes/StickyNote/StickyNote.node.js",
      "dist/nodes/NoOp/NoOp.node.js",
      "dist/nodes/Onfleet/Onfleet.node.js",
      "dist/nodes/Onfleet/OnfleetTrigger.node.js",
      "dist/nodes/Netscaler/ADC/NetscalerAdc.node.js",
      "dist/nodes/Notion/Notion.node.js",
      "dist/nodes/Notion/NotionTrigger.node.js",
      "dist/nodes/Npm/Npm.node.js",
      "dist/nodes/Odoo/Odoo.node.js",
      "dist/nodes/Okta/Okta.node.js",
      "dist/nodes/OneSimpleApi/OneSimpleApi.node.js",
      "dist/nodes/OpenAi/OpenAi.node.js",
      "dist/nodes/OpenThesaurus/OpenThesaurus.node.js",
      "dist/nodes/OpenWeatherMap/OpenWeatherMap.node.js",
      "dist/nodes/Oracle/Sql/OracleSql.node.js",
      "dist/nodes/Orbit/Orbit.node.js",
      "dist/nodes/Oura/Oura.node.js",
      "dist/nodes/Paddle/Paddle.node.js",
      "dist/nodes/PagerDuty/PagerDuty.node.js",
      "dist/nodes/PayPal/PayPal.node.js",
      "dist/nodes/PayPal/PayPalTrigger.node.js",
      "dist/nodes/Peekalink/Peekalink.node.js",
      "dist/nodes/Perplexity/Perplexity.node.js",
      "dist/nodes/Phantombuster/Phantombuster.node.js",
      "dist/nodes/PhilipsHue/PhilipsHue.node.js",
      "dist/nodes/Pipedrive/Pipedrive.node.js",
      "dist/nodes/Pipedrive/PipedriveTrigger.node.js",
      "dist/nodes/Plivo/Plivo.node.js",
      "dist/nodes/PostBin/PostBin.node.js",
      "dist/nodes/Postgres/Postgres.node.js",
      "dist/nodes/Postgres/PostgresTrigger.node.js",
      "dist/nodes/PostHog/PostHog.node.js",
      "dist/nodes/Postmark/PostmarkTrigger.node.js",
      "dist/nodes/ProfitWell/ProfitWell.node.js",
      "dist/nodes/Pushbullet/Pushbullet.node.js",
      "dist/nodes/Pushcut/Pushcut.node.js",
      "dist/nodes/Pushcut/PushcutTrigger.node.js",
      "dist/nodes/Pushover/Pushover.node.js",
      "dist/nodes/QuestDb/QuestDb.node.js",
      "dist/nodes/QuickBase/QuickBase.node.js",
      "dist/nodes/QuickBooks/QuickBooks.node.js",
      "dist/nodes/QuickChart/QuickChart.node.js",
      "dist/nodes/RabbitMQ/RabbitMQ.node.js",
      "dist/nodes/RabbitMQ/RabbitMQTrigger.node.js",
      "dist/nodes/Raindrop/Raindrop.node.js",
      "dist/nodes/ReadBinaryFile/ReadBinaryFile.node.js",
      "dist/nodes/ReadBinaryFiles/ReadBinaryFiles.node.js",
      "dist/nodes/ReadPdf/ReadPDF.node.js",
      "dist/nodes/Reddit/Reddit.node.js",
      "dist/nodes/Redis/Redis.node.js",
      "dist/nodes/Redis/RedisTrigger.node.js",
      "dist/nodes/RenameKeys/RenameKeys.node.js",
      "dist/nodes/RespondToWebhook/RespondToWebhook.node.js",
      "dist/nodes/Rocketchat/Rocketchat.node.js",
      "dist/nodes/RssFeedRead/RssFeedRead.node.js",
      "dist/nodes/RssFeedRead/RssFeedReadTrigger.node.js",
      "dist/nodes/Rundeck/Rundeck.node.js",
      "dist/nodes/S3/S3.node.js",
      "dist/nodes/Salesforce/Salesforce.node.js",
      "dist/nodes/Salesforce/SalesforceTrigger.node.js",
      "dist/nodes/Salesmate/Salesmate.node.js",
      "dist/nodes/Schedule/ScheduleTrigger.node.js",
      "dist/nodes/SeaTable/SeaTable.node.js",
      "dist/nodes/SeaTable/SeaTableTrigger.node.js",
      "dist/nodes/SecurityScorecard/SecurityScorecard.node.js",
      "dist/nodes/Segment/Segment.node.js",
      "dist/nodes/SendGrid/SendGrid.node.js",
      "dist/nodes/Sendy/Sendy.node.js",
      "dist/nodes/SentryIo/SentryIo.node.js",
      "dist/nodes/ServiceNow/ServiceNow.node.js",
      "dist/nodes/Set/Set.node.js",
      "dist/nodes/Shopify/Shopify.node.js",
      "dist/nodes/Shopify/ShopifyTrigger.node.js",
      "dist/nodes/Signl4/Signl4.node.js",
      "dist/nodes/Simulate/Simulate.node.js",
      "dist/nodes/Simulate/SimulateTrigger.node.js",
      "dist/nodes/Slack/Slack.node.js",
      "dist/nodes/Slack/SlackTrigger.node.js",
      "dist/nodes/Sms77/Sms77.node.js",
      "dist/nodes/Snowflake/Snowflake.node.js",
      "dist/nodes/SplitInBatches/SplitInBatches.node.js",
      "dist/nodes/Splunk/Splunk.node.js",
      "dist/nodes/Spotify/Spotify.node.js",
      "dist/nodes/SpreadsheetFile/SpreadsheetFile.node.js",
      "dist/nodes/SseTrigger/SseTrigger.node.js",
      "dist/nodes/Ssh/Ssh.node.js",
      "dist/nodes/Stackby/Stackby.node.js",
      "dist/nodes/StopAndError/StopAndError.node.js",
      "dist/nodes/Storyblok/Storyblok.node.js",
      "dist/nodes/Strapi/Strapi.node.js",
      "dist/nodes/Strava/Strava.node.js",
      "dist/nodes/Strava/StravaTrigger.node.js",
      "dist/nodes/Stripe/Stripe.node.js",
      "dist/nodes/Stripe/StripeTrigger.node.js",
      "dist/nodes/Supabase/Supabase.node.js",
      "dist/nodes/SurveyMonkey/SurveyMonkeyTrigger.node.js",
      "dist/nodes/Switch/Switch.node.js",
      "dist/nodes/SyncroMSP/SyncroMsp.node.js",
      "dist/nodes/Taiga/Taiga.node.js",
      "dist/nodes/Taiga/TaigaTrigger.node.js",
      "dist/nodes/Tapfiliate/Tapfiliate.node.js",
      "dist/nodes/Telegram/Telegram.node.js",
      "dist/nodes/Telegram/TelegramTrigger.node.js",
      "dist/nodes/TheHiveProject/TheHiveProject.node.js",
      "dist/nodes/TheHiveProject/TheHiveProjectTrigger.node.js",
      "dist/nodes/TheHive/TheHive.node.js",
      "dist/nodes/TheHive/TheHiveTrigger.node.js",
      "dist/nodes/TimescaleDb/TimescaleDb.node.js",
      "dist/nodes/Todoist/Todoist.node.js",
      "dist/nodes/Toggl/TogglTrigger.node.js",
      "dist/nodes/Totp/Totp.node.js",
      "dist/nodes/TravisCi/TravisCi.node.js",
      "dist/nodes/Trello/Trello.node.js",
      "dist/nodes/Trello/TrelloTrigger.node.js",
      "dist/nodes/TimeSaved/TimeSaved.node.js",
      "dist/nodes/Twake/Twake.node.js",
      "dist/nodes/Twilio/Twilio.node.js",
      "dist/nodes/Twilio/TwilioTrigger.node.js",
      "dist/nodes/Twist/Twist.node.js",
      "dist/nodes/Twitter/Twitter.node.js",
      "dist/nodes/Typeform/TypeformTrigger.node.js",
      "dist/nodes/UnleashedSoftware/UnleashedSoftware.node.js",
      "dist/nodes/Uplead/Uplead.node.js",
      "dist/nodes/UProc/UProc.node.js",
      "dist/nodes/UptimeRobot/UptimeRobot.node.js",
      "dist/nodes/UrlScanIo/UrlScanIo.node.js",
      "dist/nodes/Vero/Vero.node.js",
      "dist/nodes/Venafi/ProtectCloud/VenafiTlsProtectCloud.node.js",
      "dist/nodes/Venafi/ProtectCloud/VenafiTlsProtectCloudTrigger.node.js",
      "dist/nodes/Venafi/Datacenter/VenafiTlsProtectDatacenter.node.js",
      "dist/nodes/Vonage/Vonage.node.js",
      "dist/nodes/Wait/Wait.node.js",
      "dist/nodes/Webflow/Webflow.node.js",
      "dist/nodes/Webflow/WebflowTrigger.node.js",
      "dist/nodes/Webhook/Webhook.node.js",
      "dist/nodes/Wekan/Wekan.node.js",
      "dist/nodes/WhatsApp/WhatsAppTrigger.node.js",
      "dist/nodes/WhatsApp/WhatsApp.node.js",
      "dist/nodes/Wise/Wise.node.js",
      "dist/nodes/Wise/WiseTrigger.node.js",
      "dist/nodes/WooCommerce/WooCommerce.node.js",
      "dist/nodes/WooCommerce/WooCommerceTrigger.node.js",
      "dist/nodes/Wordpress/Wordpress.node.js",
      "dist/nodes/Workable/WorkableTrigger.node.js",
      "dist/nodes/WorkflowTrigger/WorkflowTrigger.node.js",
      "dist/nodes/WriteBinaryFile/WriteBinaryFile.node.js",
      "dist/nodes/Wufoo/WufooTrigger.node.js",
      "dist/nodes/Xero/Xero.node.js",
      "dist/nodes/Xml/Xml.node.js",
      "dist/nodes/Yourls/Yourls.node.js",
      "dist/nodes/Zammad/Zammad.node.js",
      "dist/nodes/Zendesk/Zendesk.node.js",
      "dist/nodes/Zendesk/ZendeskTrigger.node.js",
      "dist/nodes/Zoho/ZohoCrm.node.js",
      "dist/nodes/Zoom/Zoom.node.js",
      "dist/nodes/Zulip/Zulip.node.js",
      "dist/nodes/Transform/Aggregate/Aggregate.node.js",
      "dist/nodes/Transform/Limit/Limit.node.js",
      "dist/nodes/Transform/RemoveDuplicates/RemoveDuplicates.node.js",
      "dist/nodes/Transform/SplitOut/SplitOut.node.js",
      "dist/nodes/Transform/Sort/Sort.node.js",
      "dist/nodes/Transform/Summarize/Summarize.node.js"
    ]
  },
  "devDependencies": {
    "@n8n/client-oauth2": "workspace:*",
    "@n8n/eslint-plugin-community-nodes": "workspace:*",
    "@n8n/typescript-config": "workspace:*",
    "@n8n/vitest-config": "workspace:*",
    "n8n-containers": "workspace:*",
    "vitest": "catalog:",
    "@types/amqplib": "^0.10.1",
    "@types/aws4": "^1.5.1",
    "@types/basic-auth": "catalog:",
    "@types/cheerio": "^0.22.15",
    "@types/eventsource": "^1.1.2",
    "@types/express": "catalog:",
    "@types/gm": "^1.25.0",
    "@types/html-to-text": "^9.0.1",
    "@types/js-nacl": "^1.3.0",
    "@types/jsonwebtoken": "catalog:",
    "@types/lodash": "catalog:",
    "@types/lossless-json": "^1.0.0",
    "@types/mailparser": "^3.4.4",
    "@types/mime-types": "catalog:",
    "@types/mssql": "^9.1.5",
    "@types/nodemailer": "^7.0.3",
    "@types/oracledb": "^6.9.1",
    "@types/promise-ftp": "^1.3.4",
    "@types/rfc2047": "^2.0.1",
    "@types/sanitize-html": "^2.11.0",
    "@types/showdown": "^1.9.4",
    "@types/ssh2-sftp-client": "^9.0.5",
    "@types/uuid": "catalog:",
    "@types/xml2js": "catalog:",
    "eslint-plugin-n8n-nodes-base": "^1.16.5",
    "n8n-core": "workspace:*"
  },
  "dependencies": {
    "@aws-sdk/client-sso-oidc": "3.808.0",
    "@kafkajs/confluent-schema-registry": "3.8.0",
    "@mozilla/readability": "0.6.0",
    "@n8n/config": "workspace:*",
    "@n8n/di": "workspace:*",
    "@n8n/errors": "workspace:*",
    "@n8n/imap": "workspace:*",
    "@thednp/dommatrix": "^2.0.12",
    "alasql": "4.4.0",
    "amqplib": "0.10.6",
    "aws4": "1.11.0",
    "basic-auth": "catalog:",
    "change-case": "4.1.2",
    "cheerio": "1.0.0-rc.6",
    "chokidar": "catalog:",
    "cron": "4.4.0",
    "csv-parse": "5.5.0",
    "currency-codes": "2.1.0",
    "eventsource": "2.0.2",
    "fast-glob": "catalog:",
    "fastest-levenshtein": "catalog:",
    "fflate": "0.7.4",
    "generate-schema": "2.6.0",
    "get-system-fonts": "2.0.2",
    "gm": "1.25.1",
    "html-to-text": "9.0.5",
    "iconv-lite": "catalog:",
    "ics": "2.40.0",
    "isbot": "3.6.13",
    "iso-639-1": "2.1.15",
    "js-nacl": "1.4.0",
    "jsdom": "23.0.1",
    "jsonwebtoken": "catalog:",
    "kafkajs": "catalog:",
    "ldapts": "4.2.6",
    "lodash": "catalog:",
    "lossless-json": "1.0.5",
    "luxon": "catalog:",
    "mailparser": "3.6.7",
    "mime-types": "catalog:",
    "minifaker": "1.34.1",
    "moment-timezone": "0.5.48",
    "mongodb": "6.11.0",
    "mqtt": "5.7.2",
    "mssql": "10.0.2",
    "mysql2": "catalog:",
    "n8n-workflow": "workspace:*",
    "node-html-markdown": "1.2.0",
    "node-ssh": "13.2.0",
    "nodemailer": "catalog:",
    "oracledb": "6.9.0",
    "otpauth": "9.1.1",
    "pdfjs-dist": "5.3.31",
    "pg": "catalog:",
    "pg-promise": "11.9.1",
    "promise-ftp": "1.3.5",
    "redis": "4.6.14",
    "rfc2047": "4.0.1",
    "rhea": "3.0.4",
    "rrule": "2.8.1",
    "rss-parser": "3.13.0",
    "sanitize-html": "2.12.1",
    "semver": "7.5.4",
    "showdown": "2.1.0",
    "simple-git": "catalog:",
    "snowflake-sdk": "2.1.0",
    "ssh2-sftp-client": "12.0.1",
    "tmp-promise": "3.0.3",
    "ts-ics": "1.2.2",
    "uuid": "catalog:",
    "vm2": "catalog:",
    "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.2/xlsx-0.20.2.tgz",
    "xml2js": "catalog:",
    "xmlhttprequest-ssl": "3.1.0"
  }
}

```

### n8n/packages/workflow/package.json
```json
{
  "name": "n8n-workflow",
  "version": "2.10.0",
  "description": "Workflow base code of n8n",
  "types": "dist/esm/index.d.ts",
  "module": "dist/esm/index.js",
  "main": "dist/cjs/index.js",
  "exports": {
    ".": {
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./common": {
      "types": "./dist/esm/common/index.d.ts",
      "import": "./dist/esm/common/index.js",
      "require": "./dist/cjs/common/index.js"
    },
    "./*": "./*"
  },
  "scripts": {
    "clean": "rimraf dist .turbo",
    "dev": "pnpm watch",
    "typecheck": "tsc --noEmit",
    "build:vite": "vite build",
    "build": "tsc --build tsconfig.build.esm.json tsconfig.build.cjs.json",
    "format": "biome format --write .",
    "format:check": "biome ci .",
    "lint": "eslint src --quiet",
    "lint:fix": "eslint src --fix",
    "watch": "tsc --build tsconfig.build.esm.json tsconfig.build.cjs.json --watch",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:dev": "vitest --watch"
  },
  "files": [
    "dist/**/*"
  ],
  "devDependencies": {
    "@langchain/core": "catalog:",
    "@n8n/config": "workspace:*",
    "@n8n/typescript-config": "workspace:*",
    "@n8n/vitest-config": "workspace:*",
    "@types/express": "catalog:",
    "@types/jmespath": "^0.15.0",
    "@types/lodash": "catalog:",
    "@types/luxon": "3.2.0",
    "@types/md5": "^2.3.5",
    "@types/xml2js": "catalog:",
    "vitest": "catalog:",
    "vitest-mock-extended": "catalog:"
  },
  "dependencies": {
    "@n8n/errors": "workspace:*",
    "@n8n/tournament": "1.0.6",
    "ast-types": "0.16.1",
    "callsites": "catalog:",
    "esprima-next": "5.8.4",
    "form-data": "catalog:",
    "jmespath": "0.16.0",
    "js-base64": "catalog:",
    "jssha": "3.3.1",
    "lodash": "catalog:",
    "luxon": "catalog:",
    "md5": "2.3.0",
    "recast": "0.22.0",
    "title-case": "3.0.3",
    "transliteration": "2.3.5",
    "xml2js": "catalog:",
    "zod": "catalog:",
    "jsonrepair": "catalog:"
  }
}

```

## traccar

*No Dependency definitions found.*

## twenty

### twenty/package.json
```json
{
  "private": true,
  "dependencies": {
    "@apollo/client": "^3.7.17",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@floating-ui/react": "^0.24.3",
    "@linaria/core": "^6.2.0",
    "@linaria/react": "^6.2.1",
    "@radix-ui/colors": "^3.0.0",
    "@sniptt/guards": "^0.2.0",
    "@tabler/icons-react": "^3.31.0",
    "@wyw-in-js/vite": "^0.7.0",
    "archiver": "^7.0.1",
    "danger-plugin-todos": "^1.3.1",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "deep-equal": "^2.2.2",
    "file-type": "16.5.4",
    "framer-motion": "^11.18.0",
    "fuse.js": "^7.1.0",
    "googleapis": "105",
    "hex-rgb": "^5.0.0",
    "immer": "^10.1.1",
    "jotai": "^2.17.1",
    "libphonenumber-js": "^1.10.26",
    "lodash.camelcase": "^4.3.0",
    "lodash.chunk": "^4.2.0",
    "lodash.compact": "^3.0.1",
    "lodash.escaperegexp": "^4.1.2",
    "lodash.groupby": "^4.6.0",
    "lodash.identity": "^3.0.0",
    "lodash.isempty": "^4.4.0",
    "lodash.isequal": "^4.5.0",
    "lodash.isobject": "^3.0.2",
    "lodash.kebabcase": "^4.1.1",
    "lodash.mapvalues": "^4.6.0",
    "lodash.merge": "^4.6.2",
    "lodash.omit": "^4.5.0",
    "lodash.pickby": "^4.6.0",
    "lodash.snakecase": "^4.1.1",
    "lodash.upperfirst": "^4.3.1",
    "microdiff": "^1.3.2",
    "planer": "^1.2.0",
    "pluralize": "^8.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-responsive": "^9.0.2",
    "react-router-dom": "^6.4.4",
    "react-tooltip": "^5.13.1",
    "remark-gfm": "^4.0.1",
    "rxjs": "^7.2.0",
    "semver": "^7.5.4",
    "slash": "^5.1.0",
    "temporal-polyfill": "^0.3.0",
    "ts-key-enum": "^2.0.12",
    "tslib": "^2.8.1",
    "type-fest": "4.10.1",
    "typescript": "5.9.2",
    "uuid": "^9.0.0",
    "vite-tsconfig-paths": "^4.2.1",
    "xlsx-ugnis": "^0.19.3",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@babel/core": "^7.14.5",
    "@babel/preset-react": "^7.14.5",
    "@babel/preset-typescript": "^7.24.6",
    "@chromatic-com/storybook": "^4.1.3",
    "@graphql-codegen/cli": "^3.3.1",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@graphql-codegen/typescript": "^3.0.4",
    "@graphql-codegen/typescript-operations": "^3.0.4",
    "@graphql-codegen/typescript-react-apollo": "^3.3.7",
    "@nx/eslint": "22.3.3",
    "@nx/eslint-plugin": "22.3.3",
    "@nx/jest": "22.3.3",
    "@nx/js": "22.3.3",
    "@nx/react": "22.3.3",
    "@nx/storybook": "22.3.3",
    "@nx/vite": "22.3.3",
    "@nx/web": "22.3.3",
    "@sentry/types": "^8",
    "@storybook-community/storybook-addon-cookie": "^5.0.0",
    "@storybook/addon-coverage": "^3.0.0",
    "@storybook/addon-docs": "^10.2.13",
    "@storybook/addon-links": "^10.2.13",
    "@storybook/addon-vitest": "^10.2.13",
    "@storybook/icons": "^2.0.1",
    "@storybook/react-vite": "^10.2.13",
    "@storybook/test-runner": "^0.24.2",
    "@stylistic/eslint-plugin": "^1.5.0",
    "@swc-node/register": "1.11.1",
    "@swc/cli": "^0.3.12",
    "@swc/core": "1.15.11",
    "@swc/helpers": "~0.5.18",
    "@swc/jest": "^0.2.39",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/addressparser": "^1.0.3",
    "@types/bcrypt": "^5.0.0",
    "@types/bytes": "^3.1.1",
    "@types/chrome": "^0.0.267",
    "@types/deep-equal": "^1.0.1",
    "@types/fs-extra": "^11.0.4",
    "@types/graphql-fields": "^1.3.6",
    "@types/inquirer": "^9.0.9",
    "@types/jest": "^30.0.0",
    "@types/lodash.camelcase": "^4.3.7",
    "@types/lodash.compact": "^3.0.9",
    "@types/lodash.escaperegexp": "^4.1.9",
    "@types/lodash.groupby": "^4.6.9",
    "@types/lodash.identity": "^3.0.9",
    "@types/lodash.isempty": "^4.4.7",
    "@types/lodash.isequal": "^4.5.7",
    "@types/lodash.isobject": "^3.0.7",
    "@types/lodash.kebabcase": "^4.1.7",
    "@types/lodash.mapvalues": "^4.6.9",
    "@types/lodash.omit": "^4.5.9",
    "@types/lodash.pickby": "^4.6.9",
    "@types/lodash.snakecase": "^4.1.7",
    "@types/lodash.upperfirst": "^4.3.7",
    "@types/ms": "^0.7.31",
    "@types/node": "^24.0.0",
    "@types/passport-google-oauth20": "^2.0.11",
    "@types/passport-jwt": "^3.0.8",
    "@types/passport-microsoft": "^2.1.0",
    "@types/pluralize": "^0.0.33",
    "@types/react": "^18.2.39",
    "@types/react-datepicker": "^6.2.0",
    "@types/react-dom": "^18.2.15",
    "@types/supertest": "^2.0.11",
    "@types/uuid": "^9.0.2",
    "@typescript-eslint/eslint-plugin": "^8.39.0",
    "@typescript-eslint/parser": "^8.39.0",
    "@typescript-eslint/utils": "^8.39.0",
    "@typescript/native-preview": "^7.0.0-dev.20260116.1",
    "@vitejs/plugin-react-swc": "4.2.3",
    "@vitest/browser-playwright": "^4.0.18",
    "@vitest/coverage-istanbul": "^4.0.18",
    "@vitest/coverage-v8": "^4.0.18",
    "@yarnpkg/types": "^4.0.0",
    "chromatic": "^6.18.0",
    "concurrently": "^8.2.2",
    "danger": "^13.0.4",
    "dotenv-cli": "^7.4.4",
    "esbuild": "^0.25.10",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-lingui": "^0.9.0",
    "eslint-plugin-mdx": "^3.6.2",
    "eslint-plugin-prefer-arrow": "^1.2.3",
    "eslint-plugin-prettier": "^5.1.2",
    "eslint-plugin-project-structure": "^3.9.1",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "eslint-plugin-simple-import-sort": "^10.0.0",
    "eslint-plugin-storybook": "^10.2.13",
    "eslint-plugin-unicorn": "^56.0.1",
    "eslint-plugin-unused-imports": "^3.0.0",
    "http-server": "^14.1.1",
    "jest": "29.7.0",
    "jest-environment-jsdom": "30.0.0-beta.3",
    "jest-environment-node": "^29.4.1",
    "jest-fetch-mock": "^3.0.3",
    "jsdom": "~22.1.0",
    "msw": "^2.12.7",
    "msw-storybook-addon": "^2.0.6",
    "nx": "22.3.3",
    "prettier": "^3.1.1",
    "raw-loader": "^4.0.2",
    "rimraf": "^5.0.5",
    "source-map-support": "^0.5.20",
    "storybook": "^10.2.13",
    "storybook-addon-mock-date": "2.0.0",
    "storybook-addon-pseudo-states": "^10.2.13",
    "supertest": "^6.1.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.2.3",
    "ts-node": "10.9.1",
    "tsc-alias": "^1.8.16",
    "tsconfig-paths": "^4.2.0",
    "tsx": "^4.17.0",
    "vite": "^7.0.0",
    "vitest": "^4.0.18"
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": ">=4.0.2"
  },
  "license": "AGPL-3.0",
  "name": "twenty",
  "packageManager": "yarn@4.9.2",
  "resolutions": {
    "graphql": "16.8.1",
    "type-fest": "4.10.1",
    "typescript": "5.9.2",
    "graphql-redis-subscriptions/ioredis": "^5.6.0",
    "@lingui/core": "5.1.2",
    "@types/qs": "6.9.16"
  },
  "version": "0.2.1",
  "nx": {},
  "scripts": {
    "docs:generate": "tsx packages/twenty-docs/scripts/generate-docs-json.ts",
    "docs:generate-navigation-template": "tsx packages/twenty-docs/scripts/generate-navigation-template.ts",
    "docs:generate-paths": "tsx packages/twenty-docs/scripts/generate-documentation-paths.ts",
    "start": "npx concurrently --kill-others 'npx nx run-many -t start -p twenty-server twenty-front' 'npx wait-on tcp:3000 && npx nx run twenty-server:worker'"
  },
  "workspaces": {
    "packages": [
      "packages/twenty-front",
      "packages/twenty-server",
      "packages/twenty-emails",
      "packages/twenty-ui",
      "packages/twenty-utils",
      "packages/twenty-zapier",
      "packages/twenty-website",
      "packages/twenty-docs",
      "packages/twenty-e2e-testing",
      "packages/twenty-shared",
      "packages/twenty-sdk",
      "packages/twenty-apps",
      "packages/twenty-cli",
      "packages/create-twenty-app",
      "packages/twenty-eslint-rules"
    ]
  },
  "prettier": {
    "singleQuote": true,
    "trailingComma": "all",
    "endOfLine": "lf"
  }
}

```

### twenty/packages/create-twenty-app/package.json
```json
{
  "name": "create-twenty-app",
  "version": "0.6.2",
  "description": "Command-line interface to create Twenty application",
  "main": "dist/cli.cjs",
  "bin": "dist/cli.cjs",
  "files": [
    "dist",
    "README.md",
    "package.json"
  ],
  "scripts": {
    "build": "npx rimraf dist && npx vite build"
  },
  "keywords": [
    "twenty",
    "cli",
    "crm",
    "application",
    "development"
  ],
  "exports": {
    ".": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.mjs",
      "require": "./dist/cli.cjs"
    }
  },
  "license": "AGPL-3.0",
  "dependencies": {
    "@genql/cli": "^3.0.3",
    "chalk": "^5.3.0",
    "commander": "^12.0.0",
    "fs-extra": "^11.2.0",
    "inquirer": "^10.0.0",
    "lodash.camelcase": "^4.3.0",
    "lodash.kebabcase": "^4.1.1",
    "lodash.startcase": "^4.4.0",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/lodash.camelcase": "^4.3.7",
    "@types/lodash.kebabcase": "^4.1.7",
    "@types/lodash.startcase": "^4",
    "@types/node": "^20.0.0",
    "twenty-sdk": "workspace:*",
    "twenty-shared": "workspace:*",
    "typescript": "^5.9.2",
    "vite": "^7.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vite-tsconfig-paths": "^4.2.1"
  },
  "engines": {
    "node": "^24.5.0",
    "yarn": "^4.0.2"
  }
}

```

### twenty/packages/twenty-cli/package.json
```json
{
  "name": "twenty-cli",
  "version": "0.3.1",
  "description": "[DEPRECATED] Use twenty-sdk instead: https://www.npmjs.com/package/twenty-sdk",
  "scripts": {
    "build": "echo 'use npx nx build'",
    "start": "echo 'deprecated'"
  },
  "license": "AGPL-3.0"
}

```

### twenty/packages/twenty-docs/package.json
```json
{
  "name": "twenty-docs",
  "description": "Twenty documentation site powered by Mintlify",
  "author": "",
  "private": true,
  "license": "AGPL-3.0",
  "scripts": {
    "dev": "mintlify dev",
    "build": "mintlify build",
    "fix-links": "bash scripts/fix-translated-links.sh",
    "lint": "eslint **/*.mdx --max-warnings=0"
  },
  "dependencies": {
    "mintlify": "latest"
  },
  "devDependencies": {
    "twenty-shared": "workspace:*"
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  }
}

```

### twenty/packages/twenty-e2e-testing/package.json
```json
{
  "name": "twenty-e2e-testing",
  "description": "",
  "author": "",
  "private": true,
  "license": "AGPL-3.0",
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "playwright": "^1.56.1"
  }
}

```

### twenty/packages/twenty-emails/package.json
```json
{
  "name": "twenty-emails",
  "description": "",
  "author": "",
  "private": true,
  "license": "AGPL-3.0",
  "main": "./dist/index.js",
  "scripts": {
    "build": "npx vite build"
  },
  "dependencies": {
    "@lingui/core": "^5.1.2",
    "@lingui/react": "^5.1.2",
    "twenty-shared": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0"
  },
  "devDependencies": {
    "@lingui/cli": "^5.1.2",
    "@lingui/swc-plugin": "^5.11.0",
    "@lingui/vite-plugin": "^5.1.2",
    "@react-email/preview-server": "5.1.0",
    "@tiptap/core": "^3.4.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "react-email": "5.1.0",
    "vite-plugin-dts": "3.8.1"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  }
}

```

### twenty/packages/twenty-front/package.json
```json
{
  "name": "twenty-front",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "NODE_ENV=production VITE_DISABLE_TYPESCRIPT_CHECKER=true NODE_OPTIONS=--max-old-space-size=8192 npx vite build && sh ./scripts/inject-runtime-env.sh",
    "build:sourcemaps": "NODE_ENV=production VITE_BUILD_SOURCEMAP=true VITE_DISABLE_TYPESCRIPT_CHECKER=true NODE_OPTIONS=--max-old-space-size=8192 npx vite build && sh ./scripts/inject-runtime-env.sh",
    "start:prod": "NODE_ENV=production npx serve -s build",
    "tsup": "npx tsup"
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "msw": {
    "workerDirectory": "public"
  },
  "dependencies": {
    "@ai-sdk/react": "3.0.99",
    "@apollo/client": "^3.7.17",
    "@blocknote/mantine": "0.47.0",
    "@blocknote/react": "0.47.0",
    "@blocknote/xl-docx-exporter": "0.47.0",
    "@blocknote/xl-pdf-exporter": "0.47.0",
    "@calcom/embed-react": "^1.5.3",
    "@cyntler/react-doc-viewer": "^1.17.0",
    "@dagrejs/dagre": "^1.1.2",
    "@floating-ui/react": "^0.24.3",
    "@graphiql/plugin-explorer": "^1.0.2",
    "@graphiql/react": "^0.23.0",
    "@hello-pangea/dnd": "^16.2.0",
    "@hookform/resolvers": "^5.2.2",
    "@lingui/core": "^5.1.2",
    "@lingui/detect-locale": "^5.2.0",
    "@lingui/react": "^5.1.2",
    "@mantine/core": "^8.3.11",
    "@mantine/hooks": "^8.3.11",
    "@mantine/utils": "^6.0.22",
    "@monaco-editor/react": "^4.7.0",
    "@nivo/core": "^0.99.0",
    "@nivo/line": "^0.99.0",
    "@nivo/pie": "^0.99.0",
    "@nivo/radial-bar": "^0.99.0",
    "@react-email/components": "^0.5.3",
    "@react-pdf/renderer": "^4.1.6",
    "@scalar/api-reference-react": "^0.4.36",
    "@sentry/react": "^10.27.0",
    "@tiptap/core": "3.4.2",
    "@tiptap/extension-bold": "3.4.2",
    "@tiptap/extension-document": "3.4.2",
    "@tiptap/extension-hard-break": "3.4.2",
    "@tiptap/extension-heading": "3.4.2",
    "@tiptap/extension-image": "3.4.4",
    "@tiptap/extension-italic": "3.4.2",
    "@tiptap/extension-link": "3.4.2",
    "@tiptap/extension-list": "3.4.2",
    "@tiptap/extension-paragraph": "3.4.2",
    "@tiptap/extension-strike": "3.4.2",
    "@tiptap/extension-text": "3.4.2",
    "@tiptap/extension-underline": "3.4.2",
    "@tiptap/extensions": "3.4.2",
    "@tiptap/react": "3.4.2",
    "@types/marked": "^6.0.0",
    "@xyflow/react": "^12.4.2",
    "ai": "6.0.97",
    "apollo-link-rest": "^0.9.0",
    "apollo-upload-client": "^17.0.0",
    "buffer": "^6.0.3",
    "cron-parser": "5.1.1",
    "date-fns": "^2.30.0",
    "file-saver": "^2.0.5",
    "graphiql": "^3.1.1",
    "graphql": "16.8.1",
    "graphql-sse": "^2.5.4",
    "input-otp": "^1.4.2",
    "jotai": "^2.17.1",
    "js-cookie": "^3.0.5",
    "json-2-csv": "^5.4.0",
    "json-logic-js": "^2.0.5",
    "jwt-decode": "^4.0.0",
    "linkify-react": "^4.1.3",
    "linkifyjs": "^4.1.3",
    "marked": "^17.0.1",
    "qs": "^6.11.2",
    "react-data-grid": "7.0.0-beta.13",
    "react-datepicker": "^6.7.1",
    "react-dropzone": "^14.2.3",
    "react-error-boundary": "^4.0.11",
    "react-grid-layout": "^1.5.2",
    "react-helmet-async": "^1.3.0",
    "react-hook-form": "^7.45.1",
    "react-hotkeys-hook": "^4.4.4",
    "react-imask": "^7.6.0",
    "react-intersection-observer": "^9.15.1",
    "react-loading-skeleton": "^3.3.1",
    "react-markdown": "^10.1.0",
    "react-phone-number-input": "patch:react-phone-number-input@npm%3A3.4.5#../../.yarn/patches/react-phone-number-input-npm-3.4.5-dc2895c306.patch",
    "react-qr-code": "^2.0.18",
    "react-responsive": "^9.0.2",
    "react-router-dom": "^6.4.4",
    "react-textarea-autosize": "^8.4.1",
    "remark-gfm": "^4.0.1",
    "transliteration": "^2.3.5",
    "twenty-sdk": "workspace:*",
    "twenty-shared": "workspace:*",
    "twenty-ui": "workspace:*",
    "use-debounce": "^10.0.0"
  },
  "devDependencies": {
    "@lingui/cli": "^5.1.2",
    "@lingui/swc-plugin": "^5.11.0",
    "@lingui/vite-plugin": "^5.1.2",
    "@playwright/test": "^1.56.1",
    "@tiptap/suggestion": "3.4.2",
    "@types/apollo-upload-client": "^17.0.2",
    "@types/file-saver": "^2.0.7",
    "@types/js-cookie": "^3.0.3",
    "@types/json-logic-js": "^2",
    "@types/react-grid-layout": "^1",
    "@typescript-eslint/eslint-plugin": "^8.39.0",
    "@typescript-eslint/utils": "^8.39.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-lingui": "^0.9.0",
    "eslint-plugin-prefer-arrow": "^1.2.3",
    "eslint-plugin-prettier": "^5.1.2",
    "eslint-plugin-project-structure": "^3.9.1",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "eslint-plugin-simple-import-sort": "^10.0.0",
    "eslint-plugin-storybook": "^10.2.13",
    "eslint-plugin-unicorn": "^56.0.1",
    "eslint-plugin-unused-imports": "^3.0.0",
    "monaco-editor": "^0.51.0",
    "monaco-editor-auto-typings": "^0.4.5",
    "optionator": "^0.9.1",
    "playwright": "^1.56.1",
    "rollup-plugin-visualizer": "^5.14.0",
    "vite-plugin-checker": "^0.10.2",
    "vite-plugin-svgr": "^4.3.0",
    "vite-tsconfig-paths": "^4.2.1"
  }
}

```

### twenty/packages/twenty-sdk/package.json
```json
{
  "name": "twenty-sdk",
  "version": "0.6.2",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/sdk/index.d.ts",
  "bin": {
    "twenty": "dist/cli.cjs"
  },
  "files": [
    "dist",
    "generated",
    "README.md",
    "package.json"
  ],
  "scripts": {
    "build": "npx rimraf dist && npx vite build"
  },
  "keywords": [
    "twenty",
    "cli",
    "sdk",
    "crm",
    "application",
    "development"
  ],
  "exports": {
    ".": {
      "types": "./dist/sdk/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./ui": {
      "types": "./dist/ui/index.d.ts",
      "import": "./dist/ui/index.mjs",
      "require": "./dist/ui/index.cjs"
    },
    "./front-component-renderer": {
      "types": "./dist/front-component-renderer/index.d.ts",
      "import": "./dist/front-component-renderer/index.mjs",
      "require": "./dist/front-component-renderer/index.cjs"
    },
    "./generated": {
      "types": "./generated/index.ts",
      "import": "./generated/index.ts",
      "require": "./generated/index.ts"
    },
    "./generated/core": {
      "types": "./generated/core/index.ts",
      "import": "./generated/core/index.ts",
      "require": "./generated/core/index.ts"
    },
    "./generated/metadata": {
      "types": "./generated/metadata/index.ts",
      "import": "./generated/metadata/index.ts",
      "require": "./generated/metadata/index.ts"
    }
  },
  "license": "AGPL-3.0",
  "dependencies": {
    "@chakra-ui/react": "^3.33.0",
    "@emotion/react": "^11.14.0",
    "@genql/cli": "^3.0.3",
    "@genql/runtime": "^2.10.0",
    "@quilted/threads": "^4.0.1",
    "@remote-dom/core": "^1.10.1",
    "@remote-dom/react": "^1.2.2",
    "@sniptt/guards": "^0.2.0",
    "archiver": "^7.0.1",
    "axios": "^1.13.5",
    "chalk": "^5.3.0",
    "chokidar": "^4.0.0",
    "commander": "^12.0.0",
    "dotenv": "^16.4.0",
    "esbuild": "^0.25.0",
    "fast-glob": "^3.3.0",
    "fs-extra": "^11.2.0",
    "graphql": "^16.8.1",
    "graphql-sse": "^2.5.4",
    "ink": "^5.1.1",
    "inquirer": "^10.0.0",
    "jsonc-parser": "^3.2.0",
    "lodash.camelcase": "^4.3.0",
    "lodash.kebabcase": "^4.1.1",
    "preact": "^10.28.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.9.2",
    "uuid": "^13.0.0",
    "vite": "^7.0.0",
    "vite-tsconfig-paths": "^4.2.1",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@mui/material": "^7.3.8",
    "@prettier/sync": "^0.5.2",
    "@storybook/addon-vitest": "^10.2.13",
    "@storybook/react-vite": "^10.2.13",
    "@types/archiver": "^6.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/lodash.camelcase": "^4.3.7",
    "@types/lodash.kebabcase": "^4.1.9",
    "@types/node": "^24.0.0",
    "@types/react": "18.2.66",
    "@types/react-dom": "18.2.22",
    "@vitest/browser-playwright": "^4.0.18",
    "playwright": "^1.56.1",
    "storybook": "^10.2.13",
    "ts-morph": "^25.0.0",
    "tsx": "^4.7.0",
    "twenty-shared": "workspace:*",
    "twenty-ui": "workspace:*",
    "vite-plugin-dts": "^4.5.4",
    "wait-on": "^7.2.0"
  },
  "engines": {
    "node": "^24.5.0",
    "yarn": "^4.0.2"
  },
  "typesVersions": {
    "*": {
      "ui": [
        "dist/ui/index.d.ts"
      ],
      "front-component-renderer": [
        "dist/front-component-renderer/index.d.ts"
      ],
      "generated": [
        "generated/index.ts"
      ],
      "generated/core": [
        "generated/core/index.ts"
      ],
      "generated/metadata": [
        "generated/metadata/index.ts"
      ]
    }
  }
}

```

### twenty/packages/twenty-server/package.json
```json
{
  "name": "twenty-server",
  "description": "",
  "author": "",
  "private": true,
  "license": "AGPL-3.0",
  "scripts": {
    "nx": "NX_DEFAULT_PROJECT=twenty-server node ../../node_modules/nx/bin/nx.js",
    "start:prod": "node dist/main",
    "command:prod": "node dist/command/command",
    "worker:prod": "node dist/queue-worker/queue-worker",
    "database:init:prod": "npx ts-node ./scripts/setup-db.ts && yarn database:migrate:prod",
    "database:migrate:prod": "npx -y typeorm migration:run -d dist/database/typeorm/core/core.datasource",
    "clickhouse:migrate:prod": "node dist/database/clickHouse/migrations/run-migrations.js",
    "typeorm": "../../node_modules/typeorm/.bin/typeorm"
  },
  "dependencies": {
    "@ai-sdk/amazon-bedrock": "^3.0.83",
    "@ai-sdk/anthropic": "^3.0.46",
    "@ai-sdk/google": "^3.0.30",
    "@ai-sdk/groq": "^3.0.24",
    "@ai-sdk/mistral": "^3.0.20",
    "@ai-sdk/openai": "^3.0.30",
    "@ai-sdk/provider-utils": "^4.0.15",
    "@ai-sdk/xai": "^3.0.57",
    "@aws-sdk/client-lambda": "3.998.0",
    "@aws-sdk/client-s3": "3.998.0",
    "@aws-sdk/client-sesv2": "3.998.0",
    "@aws-sdk/client-sts": "3.998.0",
    "@aws-sdk/credential-providers": "3.998.0",
    "@azure/msal-node": "^3.8.4",
    "@babel/preset-env": "7.26.9",
    "@blocknote/server-util": "^0.47.0",
    "@clickhouse/client": "^1.11.0",
    "@dagrejs/dagre": "^1.1.2",
    "@e2b/code-interpreter": "^1.0.4",
    "@envelop/core": "4.0.3",
    "@envelop/on-resolve": "4.1.0",
    "@esbuild-plugins/node-modules-polyfill": "^0.2.2",
    "@eslint/js": "9.32.0",
    "@faker-js/faker": "9.8.0",
    "@graphql-tools/schema": "10.0.4",
    "@graphql-tools/utils": "9.2.1",
    "@graphql-yoga/nestjs": "patch:@graphql-yoga/nestjs@2.1.0#./patches/@graphql-yoga+nestjs+2.1.0.patch",
    "@jrmdayn/googleapis-batcher": "^0.10.1",
    "@lingui/conf": "5.1.2",
    "@lingui/core": "^5.1.2",
    "@lingui/format-po": "5.1.2",
    "@lingui/react": "5.1.2",
    "@lingui/vite-plugin": "5.1.2",
    "@microsoft/microsoft-graph-client": "3.0.7",
    "@microsoft/microsoft-graph-types": "^2.40.0",
    "@nestjs/axios": "3.1.2",
    "@nestjs/cache-manager": "^2.3.0",
    "@nestjs/common": "11.1.9",
    "@nestjs/config": "3.3.0",
    "@nestjs/core": "11.1.9",
    "@nestjs/event-emitter": "2.1.0",
    "@nestjs/graphql": "patch:@nestjs/graphql@12.1.1#./patches/@nestjs+graphql+12.1.1.patch",
    "@nestjs/jwt": "11.0.1",
    "@nestjs/passport": "11.0.5",
    "@nestjs/platform-express": "11.1.9",
    "@nestjs/schedule": "^6.0.1",
    "@nestjs/serve-static": "5.0.4",
    "@nestjs/terminus": "11.0.0",
    "@nestjs/typeorm": "11.0.0",
    "@node-saml/node-saml": "5.1.0",
    "@node-saml/passport-saml": "^5.1.0",
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.60.0",
    "@opentelemetry/exporter-metrics-otlp-http": "^0.200.0",
    "@opentelemetry/exporter-prometheus": "^0.211.0",
    "@opentelemetry/sdk-metrics": "^2.0.0",
    "@opentelemetry/sdk-node": "^0.202.0",
    "@ptc-org/nestjs-query-core": "4.4.0",
    "@ptc-org/nestjs-query-graphql": "patch:@ptc-org/nestjs-query-graphql@4.2.0#./patches/@ptc-org+nestjs-query-graphql+4.2.0.patch",
    "@ptc-org/nestjs-query-typeorm": "4.2.1-alpha.2",
    "@react-email/render": "^1.2.3",
    "@sentry/nestjs": "^10.27.0",
    "@sentry/node": "^10.27.0",
    "@sentry/profiling-node": "^10.27.0",
    "@sniptt/guards": "0.2.0",
    "addressparser": "1.0.1",
    "ai": "6.0.97",
    "apollo-server-core": "3.13.0",
    "archiver": "7.0.1",
    "axios": "^1.13.5",
    "babel-plugin-module-resolver": "5.0.2",
    "bcrypt": "5.1.1",
    "bullmq": "5.40.0",
    "bytes": "3.1.2",
    "cache-manager": "^5.4.0",
    "cache-manager-redis-yet": "^4.1.2",
    "chalk": "4.1.2",
    "class-transformer": "0.5.1",
    "class-validator": "0.14.0",
    "class-validator-jsonschema": "^5.0.2",
    "cloudflare": "^4.5.0",
    "connect-redis": "^7.1.1",
    "cron-parser": "5.1.1",
    "dataloader": "2.2.2",
    "date-fns": "2.30.0",
    "deep-equal": "2.2.3",
    "dompurify": "3.2.6",
    "dotenv": "16.4.5",
    "express": "4.22.1",
    "express-session": "^1.18.2",
    "file-type": "16.5.4",
    "gaxios": "5.1.3",
    "google-auth-library": "8.9.0",
    "googleapis": "105.0.0",
    "graphql": "16.8.1",
    "graphql-fields": "2.0.3",
    "graphql-middleware": "^6.1.35",
    "graphql-redis-subscriptions": "2.7.0",
    "graphql-scalars": "1.23.0",
    "graphql-subscriptions": "2.0.0",
    "graphql-tag": "2.12.6",
    "graphql-type-json": "0.3.2",
    "graphql-upload": "16.0.2",
    "graphql-yoga": "4.0.5",
    "html-to-text": "^9.0.5",
    "imapflow": "1.2.1",
    "ioredis": "5.6.0",
    "jsdom": "^26.1.0",
    "json-schema": "0.4.0",
    "jsonc-eslint-parser": "2.4.0",
    "jsonwebtoken": "9.0.2",
    "libphonenumber-js": "1.11.5",
    "lodash.camelcase": "4.3.0",
    "lodash.chunk": "4.2.0",
    "lodash.compact": "3.0.1",
    "lodash.differencewith": "^4.5.0",
    "lodash.groupby": "4.6.0",
    "lodash.isempty": "4.4.0",
    "lodash.isequal": "4.5.0",
    "lodash.isobject": "3.0.2",
    "lodash.kebabcase": "4.1.1",
    "lodash.merge": "^4.6.2",
    "lodash.omit": "4.5.0",
    "lodash.omitby": "^4.6.0",
    "lodash.snakecase": "4.1.1",
    "lodash.uniq": "^4.5.0",
    "lodash.uniqby": "^4.7.0",
    "lodash.upperfirst": "4.3.1",
    "mailparser": "3.9.1",
    "microdiff": "1.4.0",
    "mrmime": "^2.0.1",
    "ms": "2.1.3",
    "nest-commander": "^3.19.1",
    "node-ical": "^0.20.1",
    "nodemailer": "^7.0.11",
    "openapi-types": "12.1.3",
    "openid-client": "^5.7.0",
    "otplib": "^12.0.1",
    "passport": "^0.7.0",
    "passport-google-oauth20": "2.0.0",
    "passport-jwt": "4.0.1",
    "passport-microsoft": "2.1.0",
    "path-to-regexp": "^8.2.0",
    "pg": "8.12.0",
    "planer": "1.2.0",
    "pluralize": "8.0.0",
    "postal-mime": "^2.6.1",
    "psl": "^1.9.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "redis": "^4.7.0",
    "reflect-metadata": "0.2.2",
    "rxjs": "7.8.1",
    "semver": "7.6.3",
    "sharp": "0.32.6",
    "stripe": "19.3.1",
    "temporal-polyfill": "^0.3.0",
    "transliteration": "2.3.5",
    "tsconfig-paths": "^4.2.0",
    "tsdav": "^2.1.5",
    "tslib": "2.8.1",
    "type-fest": "4.10.1",
    "typeorm": "patch:typeorm@0.3.20#./patches/typeorm+0.3.20.patch",
    "unzipper": "^0.12.3",
    "uuid": "9.0.1",
    "vite-tsconfig-paths": "4.3.2",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@faker-js/faker": "^9.8.0",
    "@lingui/cli": "^5.1.2",
    "@nestjs/cli": "^11.0.16",
    "@nestjs/devtools-integration": "^0.2.1",
    "@nestjs/schematics": "^11.0.9",
    "@nestjs/testing": "^11.1.9",
    "@types/babel__preset-env": "7.10.0",
    "@types/bytes": "^3.1.1",
    "@types/dompurify": "^3.0.5",
    "@types/express": "^4.17.13",
    "@types/express-session": "^1.18.0",
    "@types/graphql-upload": "^16.0.7",
    "@types/html-to-text": "^9.0.4",
    "@types/lodash.chunk": "^4.2.9",
    "@types/lodash.differencewith": "^4.5.9",
    "@types/lodash.isempty": "^4.4.7",
    "@types/lodash.isequal": "^4.5.8",
    "@types/lodash.isobject": "^3.0.7",
    "@types/lodash.merge": "^4.6.9",
    "@types/lodash.omit": "^4.5.9",
    "@types/lodash.omitby": "^4.6.9",
    "@types/lodash.snakecase": "^4.1.7",
    "@types/lodash.uniq": "^4.5.9",
    "@types/lodash.uniqby": "^4.7.9",
    "@types/lodash.upperfirst": "^4.3.7",
    "@types/mailparser": "^3.4.6",
    "@types/ms": "^0.7.31",
    "@types/node": "^24.0.0",
    "@types/nodemailer": "^7.0.3",
    "@types/openid-client": "^3.7.0",
    "@types/passport-google-oauth20": "^2.0.11",
    "@types/passport-jwt": "^3.0.8",
    "@types/passport-microsoft": "^2.1.0",
    "@types/pluralize": "^0.0.33",
    "@types/psl": "^1.1.3",
    "@types/react": "^18.2.39",
    "@types/unzipper": "^0",
    "@yarnpkg/types": "^4.0.0",
    "rimraf": "^5.0.5",
    "twenty-emails": "workspace:*",
    "twenty-shared": "workspace:*"
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  }
}

```

### twenty/packages/twenty-shared/package.json
```json
{
  "name": "twenty-shared",
  "private": true,
  "sideEffects": false,
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "license": "AGPL-3.0",
  "scripts": {
    "build": "npx vite build"
  },
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.26.9",
    "@lingui/core": "^5.1.2",
    "@prettier/sync": "^0.5.2",
    "@types/babel__preset-env": "^7",
    "@types/handlebars": "^4.1.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "glob": "^11.1.0",
    "tsx": "^4.19.3",
    "typescript": "^5.9.2",
    "vite": "^7.0.0",
    "vite-plugin-dts": "3.8.1",
    "vite-tsconfig-paths": "^4.2.1"
  },
  "dependencies": {
    "@sniptt/guards": "^0.2.0",
    "class-validator": "^0.14.0",
    "handlebars": "^4.7.8",
    "libphonenumber-js": "^1.10.26",
    "lodash.camelcase": "^4.3.0",
    "qs": "^6.11.2",
    "react-router-dom": "^6.4.4",
    "transliteration": "^2.3.5",
    "zod": "^4.1.11"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./ai": {
      "types": "./dist/ai/index.d.ts",
      "import": "./dist/ai.mjs",
      "require": "./dist/ai.cjs"
    },
    "./application": {
      "types": "./dist/application/index.d.ts",
      "import": "./dist/application.mjs",
      "require": "./dist/application.cjs"
    },
    "./constants": {
      "types": "./dist/constants/index.d.ts",
      "import": "./dist/constants.mjs",
      "require": "./dist/constants.cjs"
    },
    "./database-events": {
      "types": "./dist/database-events/index.d.ts",
      "import": "./dist/database-events.mjs",
      "require": "./dist/database-events.cjs"
    },
    "./logic-function": {
      "types": "./dist/logic-function/index.d.ts",
      "import": "./dist/logic-function.mjs",
      "require": "./dist/logic-function.cjs"
    },
    "./metadata": {
      "types": "./dist/metadata/index.d.ts",
      "import": "./dist/metadata.mjs",
      "require": "./dist/metadata.cjs"
    },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "import": "./dist/testing.mjs",
      "require": "./dist/testing.cjs"
    },
    "./translations": {
      "types": "./dist/translations/index.d.ts",
      "import": "./dist/translations.mjs",
      "require": "./dist/translations.cjs"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types.mjs",
      "require": "./dist/types.cjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./workflow": {
      "types": "./dist/workflow/index.d.ts",
      "import": "./dist/workflow.mjs",
      "require": "./dist/workflow.cjs"
    },
    "./workspace": {
      "types": "./dist/workspace/index.d.ts",
      "import": "./dist/workspace.mjs",
      "require": "./dist/workspace.cjs"
    }
  },
  "files": [
    "dist",
    "ai",
    "application",
    "constants",
    "database-events",
    "logic-function",
    "metadata",
    "testing",
    "translations",
    "types",
    "utils",
    "workflow",
    "workspace"
  ],
  "typesVersions": {
    "*": {
      "ai": [
        "dist/ai/index.d.ts"
      ],
      "application": [
        "dist/application/index.d.ts"
      ],
      "constants": [
        "dist/constants/index.d.ts"
      ],
      "database-events": [
        "dist/database-events/index.d.ts"
      ],
      "logic-function": [
        "dist/logic-function/index.d.ts"
      ],
      "metadata": [
        "dist/metadata/index.d.ts"
      ],
      "testing": [
        "dist/testing/index.d.ts"
      ],
      "translations": [
        "dist/translations/index.d.ts"
      ],
      "types": [
        "dist/types/index.d.ts"
      ],
      "utils": [
        "dist/utils/index.d.ts"
      ],
      "workflow": [
        "dist/workflow/index.d.ts"
      ],
      "workspace": [
        "dist/workspace/index.d.ts"
      ]
    }
  }
}

```

### twenty/packages/twenty-ui/package.json
```json
{
  "name": "twenty-ui",
  "private": true,
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "style": "./dist/style.css",
  "type": "module",
  "sideEffects": [
    "**/*.css"
  ],
  "devDependencies": {
    "@babel/preset-env": "^7.26.9",
    "@babel/preset-react": "^7.26.3",
    "@prettier/sync": "^0.5.2",
    "@swc/plugin-emotion": "14.6.0",
    "@types/babel__preset-env": "^7",
    "@types/react": "^18.2.39",
    "@types/react-dom": "^18.2.15",
    "@wyw-in-js/babel-preset": "^0.6.0",
    "babel-plugin-inline-import": "^3.0.0",
    "babel-plugin-inline-react-svg": "^2.0.2",
    "babel-plugin-module-resolver": "^5.0.2",
    "tsx": "^4.19.3",
    "vite-plugin-checker": "^0.10.2",
    "vite-plugin-dts": "3.8.1",
    "vite-plugin-svgr": "^4.3.0"
  },
  "dependencies": {
    "@emotion/is-prop-valid": "^1.3.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@linaria/react": "^6.2.1",
    "@monaco-editor/react": "^4.7.0",
    "@sniptt/guards": "^0.2.0",
    "@tabler/icons-react": "^3.31.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^11.18.0",
    "glob": "^11.1.0",
    "hex-rgb": "^5.0.0",
    "jotai": "^2.17.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-responsive": "^9.0.2",
    "react-router-dom": "^6.4.4",
    "react-tooltip": "^5.13.1",
    "twenty-shared": "workspace:*",
    "zod": "^4.1.11"
  },
  "peerDependencies": {
    "monaco-editor": ">= 0.25.0 < 1"
  },
  "scripts": {
    "build": "npx vite build"
  },
  "files": [
    "dist",
    "accessibility",
    "assets",
    "components",
    "display",
    "feedback",
    "input",
    "json-visualizer",
    "layout",
    "navigation",
    "testing",
    "theme",
    "utilities"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css",
    "./accessibility": {
      "types": "./dist/accessibility/index.d.ts",
      "import": "./dist/accessibility.mjs",
      "require": "./dist/accessibility.cjs"
    },
    "./assets": {
      "types": "./dist/assets/index.d.ts",
      "import": "./dist/assets.mjs",
      "require": "./dist/assets.cjs"
    },
    "./components": {
      "types": "./dist/components/index.d.ts",
      "import": "./dist/components.mjs",
      "require": "./dist/components.cjs"
    },
    "./display": {
      "types": "./dist/display/index.d.ts",
      "import": "./dist/display.mjs",
      "require": "./dist/display.cjs"
    },
    "./feedback": {
      "types": "./dist/feedback/index.d.ts",
      "import": "./dist/feedback.mjs",
      "require": "./dist/feedback.cjs"
    },
    "./input": {
      "types": "./dist/input/index.d.ts",
      "import": "./dist/input.mjs",
      "require": "./dist/input.cjs"
    },
    "./json-visualizer": {
      "types": "./dist/json-visualizer/index.d.ts",
      "import": "./dist/json-visualizer.mjs",
      "require": "./dist/json-visualizer.cjs"
    },
    "./layout": {
      "types": "./dist/layout/index.d.ts",
      "import": "./dist/layout.mjs",
      "require": "./dist/layout.cjs"
    },
    "./navigation": {
      "types": "./dist/navigation/index.d.ts",
      "import": "./dist/navigation.mjs",
      "require": "./dist/navigation.cjs"
    },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "import": "./dist/testing.mjs",
      "require": "./dist/testing.cjs"
    },
    "./theme": {
      "types": "./dist/theme/index.d.ts",
      "import": "./dist/theme.mjs",
      "require": "./dist/theme.cjs"
    },
    "./utilities": {
      "types": "./dist/utilities/index.d.ts",
      "import": "./dist/utilities.mjs",
      "require": "./dist/utilities.cjs"
    }
  },
  "typesVersions": {
    "*": {
      "accessibility": [
        "dist/accessibility/index.d.ts"
      ],
      "assets": [
        "dist/assets/index.d.ts"
      ],
      "components": [
        "dist/components/index.d.ts"
      ],
      "display": [
        "dist/display/index.d.ts"
      ],
      "feedback": [
        "dist/feedback/index.d.ts"
      ],
      "input": [
        "dist/input/index.d.ts"
      ],
      "json-visualizer": [
        "dist/json-visualizer/index.d.ts"
      ],
      "layout": [
        "dist/layout/index.d.ts"
      ],
      "navigation": [
        "dist/navigation/index.d.ts"
      ],
      "testing": [
        "dist/testing/index.d.ts"
      ],
      "theme": [
        "dist/theme/index.d.ts"
      ],
      "utilities": [
        "dist/utilities/index.d.ts"
      ]
    }
  }
}

```

### twenty/packages/twenty-utils/package.json
```json
{
  "name": "twenty-utils",
  "private": true,
  "scripts": {
    "nx": "NX_DEFAULT_PROJECT=twenty-front node ../../node_modules/nx/bin/nx.js",
    "danger:ci": "danger ci --use-github-checks --failOnErrors",
    "danger:congratulate": "danger ci --dangerfile ./congratulate-dangerfile.ts --use-github-checks --failOnErrors",
    "release": "node release.js"
  }
}

```

### twenty/packages/twenty-website/package.json
```json
{
  "name": "twenty-website",
  "private": true,
  "scripts": {
    "nx": "NX_DEFAULT_PROJECT=twenty-website node ../../node_modules/nx/bin/nx.js",
    "dev": "npx next dev",
    "build": "npx next build",
    "start": "npx next start",
    "lint": "ESLINT_USE_FLAT_CONFIG=true npx next lint",
    "github:sync": "npx tsx src/github/github-sync.ts",
    "github:init": "npx tsx src/github/github-sync.ts --isFullSync",
    "database:migrate": "npx tsx src/database/migrate-database.ts",
    "database:generate:pg": "npx drizzle-kit generate --config=src/database/drizzle-posgres.config.ts"
  },
  "dependencies": {
    "@codesandbox/sandpack-react": "^2.13.5",
    "@docsearch/react": "^3.6.2",
    "@keystatic/core": "^0.5.45",
    "@keystatic/next": "^5.0.3",
    "@markdoc/markdoc": "^0.5.1",
    "@nivo/calendar": "^0.99.0",
    "date-fns": "^2.30.0",
    "drizzle-orm": "^0.44.7",
    "facepaint": "^1.2.1",
    "gray-matter": "^4.0.3",
    "next": "^14.2.25",
    "next-mdx-remote": "^6.0.0",
    "next-runtime-env": "^3.3.0",
    "postgres": "^3.4.3",
    "react-tooltip": "^5.13.1",
    "twenty-ui": "workspace:*"
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^14.2.0",
    "@types/facepaint": "^1.2.5",
    "drizzle-kit": "^0.31.5",
    "eslint-config-next": "^14.2.0"
  }
}

```

### twenty/packages/twenty-zapier/package.json
```json
{
  "name": "twenty-zapier",
  "version": "2.2.0",
  "description": "Effortlessly sync Twenty with 3000+ apps. Automate tasks, boost productivity, and supercharge your customer relationships!",
  "main": "lib/index.cjs",
  "engines": {
    "node": "^24.5.0",
    "npm": "please-use-yarn",
    "yarn": "^4.0.2"
  },
  "private": true,
  "zapier": {
    "convertedByCLIVersion": "15.4.1"
  },
  "dependencies": {
    "@sniptt/guards": "^0.2.0",
    "dotenv": "^16.4.5",
    "libphonenumber-js": "^1.10.26",
    "zapier-platform-core": "15.5.1",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "jest": "29.7.0",
    "rimraf": "^3.0.2",
    "twenty-shared": "workspace:*",
    "vite": "^7.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vite-tsconfig-paths": "^4.2.1",
    "zapier-platform-cli": "^15.4.1"
  }
}

```

## mailcow-dockerized

*No Dependency definitions found.*
## hrms

### hrms/package.json (Root & Workspaces)
- **Workspaces**: `["frontend", "roster", "frappe-ui"]`
- **Root Scripts**: `postinstall`, `build`, `dev-pwa`, `dev-roster`.
- **Root Dependencies**: `html2canvas`

### hrms/frontend/package.json
```json
{
	"name": "frappe-hr-ui",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"dependencies": {
		"@ionic/vue": "^7.4.3",
		"@ionic/vue-router": "^7.4.3",
		"@vitejs/plugin-vue": "^4.4.0",
		"autoprefixer": "^10.4.19",
		"dayjs": "^1.11.11",
		"feather-icons": "^4.29.1",
		"firebase": "^10.8.0",
		"frappe-ui": "0.1.105",
		"postcss": "^8.4.5",
		"tailwindcss": "^3.4.3",
		"vite": "^5.4.10",
		"vite-plugin-pwa": "^0.20.5",
		"vue": "^3.5.12",
		"vue-router": "^4.3.2",
		"workbox-core": "^7.0.0",
		"workbox-precaching": "^7.0.0"
	}
}
```

### hrms/roster/package.json
```json
{
  "name": "roster",
  "private": true,
  "version": "0.0.0",
  "type":"module",
  "dependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "autoprefixer": "^10.4.19",
    "dayjs": "^1.11.11",
    "feather-icons": "^4.29.1",
    "frappe-ui": "0.1.105",
    "postcss": "^8.4.5",
    "tailwindcss": "^3.4.3",
    "vite": "^5.4.10",
    "vue": "^3.5.12",
    "vue-router": "^4.3.2"
  }
}
```

### hrms/hrms/setup.py (Dependencies)
- **frappe**: Core framework
- **erpnext**: Required for accounting/company integration
- **lending**: Optional integration for payroll loans
