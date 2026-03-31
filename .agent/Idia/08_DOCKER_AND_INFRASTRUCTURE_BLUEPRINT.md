# 🐳 Exhaustive Docker & Infrastructure Blueprint

> Complete unedited docker-compose.yml and Dockerfile dumps from all 9 SaaS projects to ensure 100% infrastructure preservation.

## chatwoot

### chatwoot/.devcontainer/docker-compose.base.yml
```yaml
# Docker Compose file for building the base image in GitHub Actions
# Usage: docker-compose -f .devcontainer/docker-compose.base.yml build base

version: '3'

services:
  base:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile.base
      args:
        VARIANT: 'ubuntu-22.04'
        NODE_VERSION: '24.13.0'
        RUBY_VERSION: '3.4.4'
        # On Linux, you may need to update USER_UID and USER_GID below if not your local UID is not 1000.
        USER_UID: '1000'
        USER_GID: '1000'
    image: ghcr.io/chatwoot/chatwoot_codespace:latest

```

### chatwoot/.devcontainer/docker-compose.yml
```yaml
# https://github.com/microsoft/vscode-dev-containers/blob/master/containers/python-3-postgres/.devcontainer/docker-compose.yml
# https://github.com/microsoft/vscode-dev-containers/blob/master/containers/ruby-rails/.devcontainer/devcontainer.json
#

version: '3'

services:
  app:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile
      args:
        VARIANT: 'ubuntu-22.04'
        NODE_VERSION: '24.13.0'
        RUBY_VERSION: '3.4.4'
        # On Linux, you may need to update USER_UID and USER_GID below if not your local UID is not 1000.
        USER_UID: '1000'
        USER_GID: '1000'

    volumes:
      - ..:/workspace:cached

    # Overrides default command so things don't shut down after the process ends.
    command: sleep infinity

    # Runs app on the same network as the database container, allows "forwardPorts" in devcontainer.json function.
    network_mode: service:db

  db:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:latest
    restart: unless-stopped
    network_mode: service:db
    volumes:
      - redis-data:/data

  mailhog:
    restart: unless-stopped
    image: mailhog/mailhog
    network_mode: service:db

volumes:
  postgres-data:
  redis-data:

```

### chatwoot/.devcontainer/Dockerfile
```yaml
# The below image is created out of the Dockerfile.base
# It has the dependencies already installed so that codespace will boot up fast
FROM ghcr.io/chatwoot/chatwoot_codespace:latest

# Do the set up required for chatwoot app
WORKDIR /workspace

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./
COPY Gemfile Gemfile.lock ./

# Install dependencies (will be cached if files don't change)
RUN pnpm install --frozen-lockfile && \
    gem install bundler && \
    bundle install --jobs=$(nproc)

# Copy source code after dependencies are installed
COPY . /workspace

```

### chatwoot/.devcontainer/Dockerfile.base
```yaml
ARG VARIANT="ubuntu-22.04"

FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

ENV DEBIAN_FRONTEND=noninteractive

ARG NODE_VERSION
ARG RUBY_VERSION
ARG USER_UID
ARG USER_GID
ARG PNPM_VERSION="10.2.0"
ENV PNPM_VERSION ${PNPM_VERSION}
ENV RUBY_CONFIGURE_OPTS=--disable-install-doc

# Update args in docker-compose.yaml to set the UID/GID of the "vscode" user.
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
        groupmod --gid $USER_GID vscode \
        && usermod --uid $USER_UID --gid $USER_GID vscode \
        && chmod -R $USER_UID:$USER_GID /home/vscode; \
    fi

RUN NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1) \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get update \
    && apt-get -y install --no-install-recommends \
        build-essential \
        libssl-dev \
        zlib1g-dev \
        gnupg \
        tar \
        tzdata \
        postgresql-client \
        libpq-dev \
        git \
        imagemagick \
        libyaml-dev \
        curl \
        ca-certificates \
        tmux \
        nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install rbenv and ruby for root user first
RUN git clone --depth 1 https://github.com/rbenv/rbenv.git ~/.rbenv \
    &&  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc \
    &&  echo 'eval "$(rbenv init -)"' >> ~/.bashrc
ENV PATH "/root/.rbenv/bin/:/root/.rbenv/shims/:$PATH"
RUN git clone --depth 1 https://github.com/rbenv/ruby-build.git && \
    PREFIX=/usr/local ./ruby-build/install.sh

RUN rbenv install $RUBY_VERSION && \
    rbenv global $RUBY_VERSION && \
    rbenv versions

# Set up rbenv for vscode user
RUN su - vscode -c "git clone --depth 1 https://github.com/rbenv/rbenv.git ~/.rbenv" \
    && su - vscode -c "echo 'export PATH=\"\$HOME/.rbenv/bin:\$PATH\"' >> ~/.bashrc" \
    && su - vscode -c "echo 'eval \"\$(rbenv init -)\"' >> ~/.bashrc" \
    && su - vscode -c "PATH=\"/home/vscode/.rbenv/bin:\$PATH\" rbenv install $RUBY_VERSION" \
    && su - vscode -c "PATH=\"/home/vscode/.rbenv/bin:\$PATH\" rbenv global $RUBY_VERSION"

# Install overmind and gh in single layer
RUN curl -L https://github.com/DarthSim/overmind/releases/download/v2.1.0/overmind-v2.1.0-linux-amd64.gz > overmind.gz \
  && gunzip overmind.gz \
  && mv overmind /usr/local/bin \
  && chmod +x /usr/local/bin/overmind \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update \
  && apt-get install -y --no-install-recommends gh \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Do the set up required for chatwoot app
WORKDIR /workspace
RUN chown vscode:vscode /workspace

# set up node js, pnpm and claude code in single layer
RUN npm install -g pnpm@${PNPM_VERSION} @anthropic-ai/claude-code \
    && npm cache clean --force

# Switch to vscode user
USER vscode
ENV PATH="/home/vscode/.rbenv/bin:/home/vscode/.rbenv/shims:$PATH"

# Copy dependency files first for better caching
COPY --chown=vscode:vscode Gemfile Gemfile.lock package.json pnpm-lock.yaml ./

# Install dependencies as vscode user
RUN eval "$(rbenv init -)" \
    && gem install bundler -N \
    && bundle install --jobs=$(nproc) \
    && pnpm install --frozen-lockfile

# Copy source code after dependencies are installed
COPY --chown=vscode:vscode . /workspace

```

### chatwoot/docker/Dockerfile
```yaml
# pre-build stage
FROM node:24-alpine as node
FROM ruby:3.4.4-alpine3.21 AS pre-builder

ARG NODE_VERSION="24.13.0"
ARG PNPM_VERSION="10.2.0"
ENV NODE_VERSION=${NODE_VERSION}
ENV PNPM_VERSION=${PNPM_VERSION}

# ARG default to production settings
# For development docker-compose file overrides ARGS
ARG BUNDLE_WITHOUT="development:test"
ENV BUNDLE_WITHOUT ${BUNDLE_WITHOUT}
ENV BUNDLER_VERSION=2.5.16

ARG RAILS_SERVE_STATIC_FILES=true
ENV RAILS_SERVE_STATIC_FILES ${RAILS_SERVE_STATIC_FILES}

ARG RAILS_ENV=production
ENV RAILS_ENV ${RAILS_ENV}

ARG NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"
ENV NODE_OPTIONS ${NODE_OPTIONS}

ENV BUNDLE_PATH="/gems"

RUN apk update && apk add --no-cache \
  openssl \
  tar \
  build-base \
  tzdata \
  postgresql-dev \
  postgresql-client \
  git \
  curl \
  xz \
  && mkdir -p /var/app \
  && gem install bundler -v "$BUNDLER_VERSION"

COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN npm install -g pnpm@${PNPM_VERSION}

RUN echo 'export PNPM_HOME="/root/.local/share/pnpm"' >> /root/.shrc \
  && echo 'export PATH="$PNPM_HOME:$PATH"' >> /root/.shrc \
  && export PNPM_HOME="/root/.local/share/pnpm" \
  && export PATH="$PNPM_HOME:$PATH" \
  && pnpm --version

# Persist the environment variables in Docker
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY Gemfile Gemfile.lock ./

# natively compile grpc and protobuf to support alpine musl (dialogflow-docker workflow)
# https://github.com/googleapis/google-cloud-ruby/issues/13306
# adding xz as nokogiri was failing to build libxml
# https://github.com/chatwoot/chatwoot/issues/4045
RUN apk update && apk add --no-cache build-base musl ruby-full ruby-dev gcc make musl-dev openssl openssl-dev g++ linux-headers xz vips
RUN bundle config set --local force_ruby_platform true

# Do not install development or test gems in production
RUN if [ "$RAILS_ENV" = "production" ]; then \
  bundle config set without 'development test'; bundle install -j 4 -r 3; \
  else bundle install -j 4 -r 3; \
  fi

COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . /app

# creating a log directory so that image wont fail when RAILS_LOG_TO_STDOUT is false
# https://github.com/chatwoot/chatwoot/issues/701
RUN mkdir -p /app/log

# generate production assets if production environment
RUN if [ "$RAILS_ENV" = "production" ]; then \
  SECRET_KEY_BASE=precompile_placeholder RAILS_LOG_TO_STDOUT=enabled bundle exec rake assets:precompile \
  && rm -rf spec node_modules tmp/cache; \
  fi

# Generate .git_sha file with current commit hash
RUN git rev-parse HEAD > /app/.git_sha

# Remove unnecessary files
RUN rm -rf /gems/ruby/3.4.0/cache/*.gem \
  && find /gems/ruby/3.4.0/gems/ \( -name "*.c" -o -name "*.o" \) -delete \
  && rm -rf .git \
  && rm .gitignore

# final build stage
FROM ruby:3.4.4-alpine3.21

ARG NODE_VERSION="24.13.0"
ARG PNPM_VERSION="10.2.0"
ENV NODE_VERSION=${NODE_VERSION}
ENV PNPM_VERSION=${PNPM_VERSION}

ARG BUNDLE_WITHOUT="development:test"
ENV BUNDLE_WITHOUT ${BUNDLE_WITHOUT}
ENV BUNDLER_VERSION=2.5.16

ARG EXECJS_RUNTIME="Disabled"
ENV EXECJS_RUNTIME ${EXECJS_RUNTIME}

ARG RAILS_SERVE_STATIC_FILES=true
ENV RAILS_SERVE_STATIC_FILES ${RAILS_SERVE_STATIC_FILES}

ARG BUNDLE_FORCE_RUBY_PLATFORM=1
ENV BUNDLE_FORCE_RUBY_PLATFORM ${BUNDLE_FORCE_RUBY_PLATFORM}

ARG RAILS_ENV=production
ENV RAILS_ENV ${RAILS_ENV}
ENV BUNDLE_PATH="/gems"

RUN apk update && apk add --no-cache \
  build-base \
  openssl \
  tzdata \
  postgresql-client \
  imagemagick \
  git \
  vips \
  && gem install bundler -v "$BUNDLER_VERSION"

COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN if [ "$RAILS_ENV" != "production" ]; then \
  apk add --no-cache curl \
  && ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
  && npm install -g pnpm@${PNPM_VERSION} \
  && pnpm --version; \
  fi

COPY --from=pre-builder /gems/ /gems/
COPY --from=pre-builder /app /app

# Copy .git_sha file from pre-builder stage
COPY --from=pre-builder /app/.git_sha /app/.git_sha

WORKDIR /app

EXPOSE 3000

```

### chatwoot/docker-compose.production.yaml
```yaml
version: '3'

services:
  base: &base
    image: chatwoot/chatwoot:latest
    env_file: .env ## Change this file for customized env variables
    volumes:
      - storage_data:/app/storage

  rails:
    <<: *base
    depends_on:
      - postgres
      - redis
    ports:
      - '127.0.0.1:3000:3000'
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']
    restart: always

  sidekiq:
    <<: *base
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']
    restart: always

  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    ports:
      - '127.0.0.1:5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chatwoot
      - POSTGRES_USER=postgres
      # Please provide your own password.
      - POSTGRES_PASSWORD=

  redis:
    image: redis:alpine
    restart: always
    command: ["sh", "-c", "redis-server --requirepass \"$REDIS_PASSWORD\""]
    env_file: .env
    volumes:
      - redis_data:/data
    ports:
      - '127.0.0.1:6379:6379'

volumes:
  storage_data:
  postgres_data:
  redis_data:

```

### chatwoot/docker-compose.test.yaml
```yaml
version: '3'

services:
  base: &base
    build:
      context: .
      dockerfile: ./docker/Dockerfile
      args:
        BUNDLE_WITHOUT: 'development:test'
        EXECJS_RUNTIME: Disabled
        RAILS_ENV: 'production'
        RAILS_SERVE_STATIC_FILES: 'true'
    image: chatwoot:latest
    env_file: .env ## Change this file for customized env variables

  rails:
    <<: *base
    image: chatwoot:latest
    depends_on:
      - postgres
      - redis
    ports:
      - 3000:3000
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']

  sidekiq:
    <<: *base
    image: chatwoot:latest
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']

  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    ports:
      - '5432:5432'
    volumes:
      - postgres:/data/postgres
    environment:
      - POSTGRES_DB=chatwoot
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=

  redis:
    image: redis:alpine
    restart: always
    volumes:
      - redis:/data/redis
    ports:
      - '6379:6379'

volumes:
  postgres:
  redis:
  bundle:
  packs:
  node_modules_rails:

```

### chatwoot/docker-compose.yaml
```yaml
version: '3'

services:
  base: &base
    build:
      context: .
      dockerfile: ./docker/Dockerfile
      args:
        BUNDLE_WITHOUT: ''
        EXECJS_RUNTIME: 'Node'
        RAILS_ENV: 'development'
        RAILS_SERVE_STATIC_FILES: 'false'
    tty: true
    stdin_open: true
    image: chatwoot:development
    env_file: .env

  rails:
    <<: *base
    build:
      context: .
      dockerfile: ./docker/dockerfiles/rails.Dockerfile
    image: chatwoot-rails:development
    volumes:
      - ./:/app:delegated
      - node_modules:/app/node_modules
      - packs:/app/public/packs
      - cache:/app/tmp/cache
      - bundle:/usr/local/bundle
    depends_on:
      - postgres
      - redis
      - vite
      - mailhog
      - sidekiq
    ports:
      - 3000:3000
    env_file: .env
    environment:
      - VITE_DEV_SERVER_HOST=vite
      - NODE_ENV=development
      - RAILS_ENV=development
    entrypoint: docker/entrypoints/rails.sh
    command: ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]

  sidekiq:
    <<: *base
    image: chatwoot-rails:development
    volumes:
      - ./:/app:delegated
      - node_modules:/app/node_modules
      - packs:/app/public/packs
      - cache:/app/tmp/cache
      - bundle:/usr/local/bundle
    depends_on:
      - postgres
      - redis
      - mailhog
    environment:
      - NODE_ENV=development
      - RAILS_ENV=development
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]

  vite:
    <<: *base
    build:
      context: .
      dockerfile: ./docker/dockerfiles/vite.Dockerfile
    image: chatwoot-vite:development
    volumes:
      - ./:/app:delegated
      - node_modules:/app/node_modules
      - packs:/app/public/packs
      - cache:/app/tmp/cache
      - bundle:/usr/local/bundle
    ports:
      - "3036:3036" # Vite dev server
    environment:
      - VITE_DEV_SERVER_HOST=0.0.0.0
      - NODE_ENV=development
      - RAILS_ENV=development
    entrypoint: docker/entrypoints/vite.sh
    command: bin/vite dev

  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    ports:
      - '5432:5432'
    volumes:
      - postgres:/data/postgres
    environment:
      - POSTGRES_DB=chatwoot
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=

  redis:
    image: redis:alpine
    restart: always
    command: ["sh", "-c", "redis-server --requirepass \"$REDIS_PASSWORD\""]
    env_file: .env
    volumes:
      - redis:/data/redis
    ports:
      - '6379:6379'

  mailhog:
    image: mailhog/mailhog
    ports:
      - 1025:1025
      - 8025:8025

volumes:
  postgres:
  redis:
  packs:
  node_modules:
  cache:
  bundle:

```

## erpnext

*No Docker configuration files found.*

## evolution-api

### evolution-api/Docker/kafka/docker-compose.yaml
```yaml
version: '3.3'

services:
  zookeeper:
    container_name: zookeeper
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
      - ZOOKEEPER_TICK_TIME=2000
      - ZOOKEEPER_SYNC_LIMIT=2
    volumes:
      - zookeeper_data:/var/lib/zookeeper/
    ports:
      - 2181:2181

  kafka:
    container_name: kafka
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT,OUTSIDE:PLAINTEXT
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092,OUTSIDE://host.docker.internal:9094
      - KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
      - KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1
      - KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
      - KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0
      - KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
      - KAFKA_LOG_RETENTION_HOURS=168
      - KAFKA_LOG_SEGMENT_BYTES=1073741824
      - KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS=300000
      - KAFKA_COMPRESSION_TYPE=gzip
    ports:
      - 29092:29092
      - 9092:9092
      - 9094:9094
    volumes:
      - kafka_data:/var/lib/kafka/data

volumes:
  zookeeper_data:
  kafka_data:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge
```

### evolution-api/Docker/minio/docker-compose.yaml
```yaml
version: '3.3'

services:
  minio:
    container_name: minio
    image: quay.io/minio/minio
    networks:
      - evolution-net
    command: server /data --console-address ":9001"
    restart: always
    ports:
      - 5432:5432
    environment:
      - MINIO_ROOT_USER=USER
      - MINIO_ROOT_PASSWORD=PASSWORD
      - MINIO_BROWSER_REDIRECT_URL=http:/localhost:9001
      - MINIO_SERVER_URL=http://localhost:9000
    volumes:
      - minio_data:/data
    expose:
      - 9000
      - 9001

volumes:
  minio_data:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/Docker/mysql/docker-compose.yaml
```yaml
version: '3.3'

services:
  mysql:
    container_name: mysql
    image: percona/percona-server:8.0
    networks:
      - evolution-net
    restart: always
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - TZ=America/Bahia
    volumes:
      - mysql_data:/var/lib/mysql
    expose:
      - 3306

volumes:
  mysql_data:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/Docker/postgres/docker-compose.yaml
```yaml
version: '3.3'

services:
  postgres:
    container_name: postgres
    image: postgres:15
    networks:
      - evolution-net
    command: ["postgres", "-c", "max_connections=1000"]
    restart: always
    ports:
      - 5432:5432
    environment:
      - POSTGRES_PASSWORD=PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
    expose:
      - 5432

  pgadmin:
    image: dpage/pgadmin4:latest
    networks:
      - evolution-net
    environment:
      - PGADMIN_DEFAULT_EMAIL=EMAIL
      - PGADMIN_DEFAULT_PASSWORD=PASSWORD  
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    ports:
      - 4000:80
    links:
      - postgres

volumes:
  postgres_data:
  pgadmin_data:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/Docker/rabbitmq/docker-compose.yaml
```yaml
version: '3.3'

services:
  rabbitmq:
    container_name: rabbitmq
    image: rabbitmq:management
    environment:
      - RABBITMQ_ERLANG_COOKIE=33H2CdkzF5WrnJ4ud6nkUdRTKXvbCHeFjvVL71p
      - RABBITMQ_DEFAULT_VHOST=default
      - RABBITMQ_DEFAULT_USER=USER
      - RABBITMQ_DEFAULT_PASS=PASSWORD
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq/
    ports:
      - 5672:5672
      - 15672:15672

volumes:
  rabbitmq_data:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/Docker/redis/docker-compose.yaml
```yaml
version: '3.3'

services:
  redis:
    image: redis:latest
    networks:
      - evolution-net
    container_name: redis
    command: >
      redis-server --port 6379 --appendonly yes
    volumes:
      - evolution_redis:/data
    ports:
      - 6379:6379

volumes:
  evolution_redis:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/docker-compose.dev.yaml
```yaml
services:
  api:
    container_name: evolution_api
    image: evolution/api:local
    build: .
    restart: always
    ports:
      - 8080:8080
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution-net
    env_file:
      - .env
    expose:
      - 8080

  frontend:
    container_name: evolution_frontend
    image: evolution/manager:local
    build: ./evolution-manager-v2
    restart: always
    ports:
      - "3000:80"
    networks:
      - evolution-net

volumes:
  evolution_instances:


networks:
  evolution-net:
    name: evolution-net
    driver: bridge

```

### evolution-api/docker-compose.yaml
```yaml
version: "3.8"

services:
  api:
    container_name: evolution_api
    image: evoapicloud/evolution-api:latest
    restart: always
    depends_on:
      - redis
      - evolution-postgres
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution-net
      - dokploy-network
    env_file:
      - .env
    expose:
      - "8080"

  frontend:
    container_name: evolution_frontend
    image: evoapicloud/evolution-manager:latest
    restart: always
    ports:
      - "3000:80"
    networks:
      - evolution-net

  redis:
    container_name: evolution_redis
    image: redis:latest
    restart: always
    command: >
      redis-server --port 6379 --appendonly yes
    volumes:
      - evolution_redis:/data
    networks:
      evolution-net:
        aliases:
          - evolution-redis
      dokploy-network:
        aliases:
          - evolution-redis
    expose:
      - "6379"

  evolution-postgres:
    container_name: evolution_postgres
    image: postgres:15
    restart: always
    env_file:
      - .env
    command:
      - postgres
      - -c
      - max_connections=1000
      - -c
      - listen_addresses=*
    environment:
      - POSTGRES_DB=${POSTGRES_DATABASE}
      - POSTGRES_USER=${POSTGRES_USERNAME}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evolution-net
      - dokploy-network
    expose:
      - "5432"

volumes:
  evolution_instances:
  evolution_redis:
  postgres_data:

networks:
  evolution-net:
    name: evolution-net
    driver: bridge
  dokploy-network:
    external: true
```

### evolution-api/Dockerfile
```yaml
FROM node:24-alpine AS builder

RUN apk update && \
    apk add --no-cache git ffmpeg wget curl bash openssl

LABEL version="2.3.1" description="Api to control whatsapp features through http requests." 
LABEL maintainer="Davidson Gomes" git="https://github.com/DavidsonGomes"
LABEL contact="contato@evolution-api.com"

WORKDIR /evolution

COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./tsup.config.ts ./

RUN npm ci --silent

COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./manager ./manager
COPY ./.env.example ./.env
COPY ./runWithProvider.js ./

COPY ./Docker ./Docker

RUN chmod +x ./Docker/scripts/* && dos2unix ./Docker/scripts/*

RUN ./Docker/scripts/generate_database.sh

RUN npm run build

FROM node:24-alpine AS final

RUN apk update && \
    apk add tzdata ffmpeg bash openssl

ENV TZ=America/Sao_Paulo
ENV DOCKER_ENV=true

WORKDIR /evolution

COPY --from=builder /evolution/package.json ./package.json
COPY --from=builder /evolution/package-lock.json ./package-lock.json

COPY --from=builder /evolution/node_modules ./node_modules
COPY --from=builder /evolution/dist ./dist
COPY --from=builder /evolution/prisma ./prisma
COPY --from=builder /evolution/manager ./manager
COPY --from=builder /evolution/public ./public
COPY --from=builder /evolution/.env ./.env
COPY --from=builder /evolution/Docker ./Docker
COPY --from=builder /evolution/runWithProvider.js ./runWithProvider.js
COPY --from=builder /evolution/tsup.config.ts ./tsup.config.ts

ENV DOCKER_ENV=true

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", ". ./Docker/scripts/deploy_database.sh && npm run start:prod" ]

```

### evolution-api/Dockerfile.metrics
```yaml
FROM evoapicloud/evolution-api:latest AS base
WORKDIR /evolution

# Copiamos apenas o necessário para recompilar o dist com as mudanças locais
COPY tsconfig.json tsup.config.ts package.json ./
COPY src ./src

# Recompila usando os node_modules já presentes na imagem base
RUN npm run build

# Runtime final: reaproveita a imagem oficial e apenas sobrepõe o dist
FROM evoapicloud/evolution-api:latest AS final
WORKDIR /evolution
COPY --from=base /evolution/dist ./dist

ENV PROMETHEUS_METRICS=true

# Entrada original da imagem oficial já sobe o app em /evolution


```

## frappe_docker

### frappe_docker/devcontainer-example/docker-compose.yml
```yaml
services:
  mariadb:
    image: docker.io/mariadb:11.8
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --skip-character-set-client-handshake
      - --skip-innodb-read-only-compressed # Temporary fix for MariaDB 10.6
    environment:
      MYSQL_ROOT_PASSWORD: 123
      MARIADB_AUTO_UPGRADE: 1
    volumes:
      - mariadb-data:/var/lib/mysql

  # Enable PostgreSQL only if you use it, see development/README.md for more information.
  # postgresql:
  #   image: postgres:14
  #   environment:
  #     POSTGRES_PASSWORD: 123
  #   volumes:
  #     - postgresql-data:/var/lib/postgresql/data

  # Enable Mailpit if you need to test outgoing mail services
  # See https://mailpit.axllent.org/
  #  mailpit:
  #    image: axllent/mailpit
  #    volumes:
  #      - mailpit-data:/data
  #    ports:
  #      - 8025:8025
  #      - 1025:1025
  #    environment:
  #      MP_MAX_MESSAGES: 5000
  #      MP_DATA_FILE: /data/mailpit.db
  #      MP_SMTP_AUTH_ACCEPT_ANY: 1
  #      MP_SMTP_AUTH_ALLOW_INSECURE: 1

  redis-cache:
    image: docker.io/redis:alpine

  redis-queue:
    image: docker.io/redis:alpine

  frappe:
    image: docker.io/frappe/bench:latest
    # If you want to build the current bench image the Containerfile is in this Repo.
    # build: ../images/bench
    command: sleep infinity
    environment:
      - SHELL=/bin/bash
    volumes:
      - ..:/workspace:cached
      # Enable if you require git cloning
      # - ${HOME}/.ssh:/home/frappe/.ssh
    working_dir: /workspace/development
    ports:
      - 8000-8005:8000-8005
      - 9000-9005:9000-9005
  # enable the below service if you need Cypress UI Tests to be executed
  # Before enabling ensure install_x11_deps.sh has been executed and display variable is exported.
  # Run install_x11_deps.sh again if DISPLAY is not set
  # ui-tester:
  #   # pass custom command to start Cypress otherwise it will use the entrypoint
  #   # specified in the Cypress Docker image.
  #   # also pass "--project <folder>" so that when Cypress opens
  #   # it can find file "cypress.json" and show integration specs
  #   # https://on.cypress.io/command-line#cypress-open
  #   entrypoint: 'sleep infinity'
  #   image: "docker.io/cypress/included:latest"
  #   environment:
  #     - SHELL=/bin/bash
  #     # get the IP address of the host machine and allow X11 to accept
  #     # incoming connections from that IP address
  #     #   IP=$(ipconfig getifaddr en0) or mac or \
  #     #   IP=$($(hostname -I | awk '{print $1}') )  for Ubuntu
  #     #   /usr/X11/bin/xhost + $IP
  #     # then pass the environment variable DISPLAY to show Cypress GUI on the host system
  #     #   DISPLAY=$IP:0
  #     - DISPLAY
  #   volumes:
  #     # for Cypress to communicate with the X11 server pass this socket file
  #     # in addition to any other mapped volumes
  #     - /tmp/.X11-unix:/tmp/.X11-unix
  #     - ..:/workspace:z,cached
  #   network_mode: "host"
volumes:
  mariadb-data:
  #postgresql-data:
  #mailpit-data:

```

### frappe_docker/docker-compose-prod.yml
```yaml
﻿name: frappe_docker
services:
  backend:
    depends_on:
      configurator:
        condition: service_completed_successfully
        required: true
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  configurator:
    command:
      - |
        ls -1 apps > sites/apps.txt; bench set-config -g db_host $$DB_HOST; bench set-config -gp db_port $$DB_PORT; bench set-config -g redis_cache "redis://$$REDIS_CACHE"; bench set-config -g redis_queue "redis://$$REDIS_QUEUE"; bench set-config -g redis_socketio "redis://$$REDIS_QUEUE"; bench set-config -gp socketio_port $$SOCKETIO_PORT; bench set-config -g chromium_path /usr/bin/chromium-headless-shell;
    depends_on:
      db:
        condition: service_healthy
        required: true
      redis-cache:
        condition: service_started
        required: true
      redis-queue:
        condition: service_started
        required: true
    entrypoint:
      - bash
      - -c
    environment:
      DB_HOST: db
      DB_PORT: "3306"
      REDIS_CACHE: redis-cache:6379
      REDIS_QUEUE: redis-queue:6379
      SOCKETIO_PORT: "9000"
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: on-failure
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  db:
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --skip-character-set-client-handshake
      - --skip-innodb-read-only-compressed
    environment:
      MARIADB_AUTO_UPGRADE: "1"
      MYSQL_ROOT_PASSWORD: "123"
    healthcheck:
      test:
        - CMD
        - healthcheck.sh
        - --connect
        - --innodb_initialized
      timeout: 5s
      interval: 5s
      retries: 5
      start_period: 5s
    image: mariadb:11.8
    networks:
      default: null
    restart: unless-stopped
    volumes:
      - type: volume
        source: db-data
        target: /var/lib/mysql
        volume: {}
  frontend:
    command:
      - nginx-entrypoint.sh
    depends_on:
      backend:
        condition: service_started
        required: true
      websocket:
        condition: service_started
        required: true
    environment:
      BACKEND: backend:8000
      CLIENT_MAX_BODY_SIZE: 50m
      FRAPPE_SITE_NAME_HEADER: $$host
      PROXY_READ_TIMEOUT: "120"
      SOCKETIO: websocket:9000
      UPSTREAM_REAL_IP_ADDRESS: 127.0.0.1
      UPSTREAM_REAL_IP_HEADER: X-Forwarded-For
      UPSTREAM_REAL_IP_RECURSIVE: "off"
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    ports:
      - mode: ingress
        target: 8080
        published: "8080"
        protocol: tcp
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  queue-long:
    command:
      - bench
      - worker
      - --queue
      - long,default,short
    depends_on:
      configurator:
        condition: service_completed_successfully
        required: true
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  queue-short:
    command:
      - bench
      - worker
      - --queue
      - short,default
    depends_on:
      configurator:
        condition: service_completed_successfully
        required: true
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  redis-cache:
    image: redis:6.2-alpine
    networks:
      default: null
    restart: unless-stopped
  redis-queue:
    image: redis:6.2-alpine
    networks:
      default: null
    restart: unless-stopped
    volumes:
      - type: volume
        source: redis-queue-data
        target: /data
        volume: {}
  scheduler:
    command:
      - bench
      - schedule
    depends_on:
      configurator:
        condition: service_completed_successfully
        required: true
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
  websocket:
    command:
      - node
      - /home/frappe/frappe-bench/apps/frappe/socketio.js
    depends_on:
      configurator:
        condition: service_completed_successfully
        required: true
    image: frappe/erpnext:v16.7.3
    networks:
      default: null
    platform: linux/amd64
    pull_policy: always
    restart: unless-stopped
    volumes:
      - type: volume
        source: sites
        target: /home/frappe/frappe-bench/sites
        volume: {}
networks:
  default:
    name: frappe_docker_default
volumes:
  db-data:
    name: frappe_docker_db-data
  redis-queue-data:
    name: frappe_docker_redis-queue-data
  sites:
    name: frappe_docker_sites
x-backend-defaults:
  depends_on:
    configurator:
      condition: service_completed_successfully
  image: frappe/erpnext:v16.7.3
  pull_policy: always
  restart: unless-stopped
  volumes:
    - sites:/home/frappe/frappe-bench/sites
x-customizable-image:
  image: frappe/erpnext:v16.7.3
  pull_policy: always
  restart: unless-stopped
x-depends-on-configurator:
  depends_on:
    configurator:
      condition: service_completed_successfully

```

### frappe_docker/images/bench/Dockerfile
```yaml
FROM debian:bookworm-slim AS bench

LABEL author=frappé

ARG GIT_REPO=https://github.com/frappe/bench.git
ARG GIT_BRANCH=v5.x

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
    # For frappe framework
    git \
    mariadb-client \
    postgresql-client \
    gettext-base \
    wget \
    # for PDF
    libssl-dev \
    fonts-cantarell \
    xfonts-75dpi \
    xfonts-base \
    # weasyprint dependencies
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    #Chromium
    chromium-headless-shell \
    # to work inside the container
    locales \
    build-essential \
    cron \
    curl \
    vim \
    sudo \
    iputils-ping \
    watch \
    tree \
    nano \
    less \
    software-properties-common \
    bash-completion \
    # For psycopg2
    libpq-dev \
    # Other
    libffi-dev \
    liblcms2-dev \
    libldap2-dev \
    libmariadb-dev \
    libsasl2-dev \
    libtiff5-dev \
    libwebp-dev \
    pkg-config \
    redis-tools \
    rlwrap \
    tk8.6-dev \
    ssh-client \
    # VSCode container requirements
    net-tools \
    # For pyenv build dependencies
    # https://github.com/frappe/frappe_docker/issues/840#issuecomment-1185206895
    make \
    # For pandas
    libbz2-dev \
    # For bench execute
    libsqlite3-dev \
    # For other dependencies
    zlib1g-dev \
    libreadline-dev \
    llvm \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    liblzma-dev \
    file \
    # For MIME type detection
    media-types \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales

# Detect arch and install wkhtmltopdf
ARG WKHTMLTOPDF_VERSION=0.12.6.1-3
ARG WKHTMLTOPDF_DISTRO=bookworm
RUN if [ "$(uname -m)" = "aarch64" ]; then export ARCH=arm64; fi \
    && if [ "$(uname -m)" = "x86_64" ]; then export ARCH=amd64; fi \
    && downloaded_file=wkhtmltox_${WKHTMLTOPDF_VERSION}.${WKHTMLTOPDF_DISTRO}_${ARCH}.deb \
    && wget -q https://github.com/wkhtmltopdf/packaging/releases/download/$WKHTMLTOPDF_VERSION/$downloaded_file \
    && dpkg -i $downloaded_file \
    && rm $downloaded_file

# Create new user with home directory, improve docker compatibility with UID/GID 1000,
# add user to sudo group, allow passwordless sudo, switch to that user
# and change directory to user home directory
RUN groupadd -g 1000 frappe \
    && useradd --no-log-init -r -m -u 1000 -g 1000 -G sudo frappe \
    && echo "frappe ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER frappe
WORKDIR /home/frappe

# Install Python via pyenv
ENV PYTHON_VERSION_PREV=3.12.12
ENV PYTHON_VERSION=3.14.2
ENV PYENV_ROOT=/home/frappe/.pyenv
ENV PATH=$PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH

# From https://github.com/pyenv/pyenv#basic-github-checkout
RUN git clone --depth 1 https://github.com/pyenv/pyenv.git .pyenv \
    && pyenv install $PYTHON_VERSION_PREV \
    && pyenv install $PYTHON_VERSION \
    && PYENV_VERSION=$PYTHON_VERSION_PREV pip install --no-cache-dir virtualenv \
    && PYENV_VERSION=$PYTHON_VERSION pip install --no-cache-dir virtualenv \
    && pyenv global $PYTHON_VERSION $PYTHON_VERSION_PREV \
    && sed -Ei -e '/^([^#]|$)/ {a export PYENV_ROOT="/home/frappe/.pyenv" a export PATH="$PYENV_ROOT/bin:$PATH" a ' -e ':a' -e '$!{n;ba};}' ~/.profile \
    && echo 'eval "$(pyenv init --path)"' >>~/.profile \
    && echo 'eval "$(pyenv init -)"' >>~/.bashrc

# Clone and install bench in the local user home directory
# For development, bench source is located in ~/.bench
ENV PATH=/home/frappe/.local/bin:$PATH
# Skip editable-bench warning
# https://github.com/frappe/bench/commit/20560c97c4246b2480d7358c722bc9ad13606138
RUN git clone ${GIT_REPO} --depth 1 -b ${GIT_BRANCH} .bench \
    && pip install --no-cache-dir --user -e .bench \
    && echo "export PATH=/home/frappe/.local/bin:\$PATH" >>/home/frappe/.bashrc \
    && echo "export BENCH_DEVELOPER=1" >>/home/frappe/.bashrc

# Install Node via nvm
ENV NODE_VERSION_PREV=22.22.0
ENV NODE_VERSION=24.13.0
ENV NVM_DIR=/home/frappe/.nvm
ENV PATH=${NVM_DIR}/versions/node/v${NODE_VERSION}/bin/:${PATH}

RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
    && . ${NVM_DIR}/nvm.sh \
    && nvm install ${NODE_VERSION_PREV} \
    && nvm use v${NODE_VERSION_PREV} \
    && npm install -g yarn \
    && nvm install ${NODE_VERSION} \
    && nvm use v${NODE_VERSION} \
    && npm install -g yarn \
    && nvm alias default v${NODE_VERSION} \
    && rm -rf ${NVM_DIR}/.cache \
    && echo 'export NVM_DIR="/home/frappe/.nvm"' >>~/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> ~/.bashrc \
    && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion' >> ~/.bashrc


EXPOSE 8000-8005 9000-9005 6787

FROM bench AS bench-test

# Print version and verify bashrc is properly sourced so that everything works
# in the interactive shell and Dockerfile

RUN node --version \
    && npm --version \
    && yarn --version \
    && bench --help

RUN bash -c "node --version" \
    && bash -c "npm --version" \
    && bash -c "yarn --version" \
    && bash -c "bench --help"

```

## jasmin

### jasmin/docker/Dockerfile
```yaml
FROM python:3.11-slim-bullseye

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r jasmin && useradd -r -g jasmin jasmin

# Install requirements
RUN apt-get update && apt-get install -y \
    libffi-dev \
    libssl-dev \
    # Run python with jemalloc
    # More on this:
    # - https://zapier.com/engineering/celery-python-jemalloc/
    # - https://paste.pics/581cc286226407ab0be400b94951a7d9
    libjemalloc2

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Run python with jemalloc
ENV LD_PRELOAD /usr/lib/x86_64-linux-gnu/libjemalloc.so.2

ENV ROOT_PATH /
ENV CONFIG_PATH /etc/jasmin
ENV RESOURCE_PATH /etc/jasmin/resource
ENV STORE_PATH /etc/jasmin/store
ENV LOG_PATH /var/log/jasmin

RUN mkdir -p ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}
RUN chown jasmin:jasmin ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}

WORKDIR /build

COPY . .

RUN pip install .

ENV UNICODEMAP_JP unicode-ascii

COPY misc/config/*.cfg ${CONFIG_PATH}/
COPY misc/config/resource ${RESOURCE_PATH}

WORKDIR /etc/jasmin

# Default Redis and RabbitMQ connections
ENV AMQP_BROKER_HOST 'rabbitmq'
ENV AMQP_BROKER_PORT 5672
ENV REDIS_CLIENT_HOST 'redis'
ENV REDIS_CLIENT_PORT 6379

# Change binding host for jcli
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' ${CONFIG_PATH}/jasmin.cfg
# Change binding port for redis, and amqp
RUN sed -i "/\[redis-client\]/a port=$REDIS_CLIENT_PORT" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a port=$AMQP_BROKER_PORT" ${CONFIG_PATH}/jasmin.cfg
# Change binding host for redis, and amqp
RUN sed -i "/\[redis-client\]/a host=$REDIS_CLIENT_HOST" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a host=$AMQP_BROKER_HOST" ${CONFIG_PATH}/jasmin.cfg

EXPOSE 2775 8990 1401
VOLUME ["/var/log/jasmin", "/etc/jasmin", "/etc/jasmin/store"]

COPY docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes
# - restapi (0.9rc16+) is not started in this docker configuration

```

### jasmin/docker/Dockerfile.alpine
```yaml
FROM python:3.11-alpine

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN addgroup -S jasmin && adduser -S -g jasmin jasmin

# Install requirements
RUN apk --update add \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    python3-dev \
    py3-pip \
    git \
    bash 

WORKDIR /build

ENV ROOT_PATH /
ENV CONFIG_PATH /etc/jasmin
ENV RESOURCE_PATH /etc/jasmin/resource
ENV STORE_PATH /etc/jasmin/store
ENV LOG_PATH /var/log/jasmin

RUN mkdir -p ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}
RUN chown jasmin:jasmin ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}

WORKDIR /build

RUN pip install -e git+https://github.com/jookies/txamqp.git@master#egg=txamqp3
RUN pip install -e git+https://github.com/jookies/python-messaging.git@master#egg=python-messaging
RUN pip install -e git+https://github.com/jookies/smpp.pdu.git@master#egg=smpp.pdu3
RUN pip install -e git+https://github.com/jookies/smpp.twisted.git@master#egg=smpp.twisted3

COPY . .

RUN pip install .

COPY misc/config/*.cfg ${CONFIG_PATH}
COPY misc/config/resource/*.xml ${RESOURCE_PATH}

ENV UNICODEMAP_JP unicode-ascii

WORKDIR /usr/jasmin

# Change binding host for jcli, redis, and amqp
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' ${CONFIG_PATH}/jasmin.cfg
RUN sed -i '/\[redis-client\]/a host=redis' ${CONFIG_PATH}/jasmin.cfg
RUN sed -i '/\[amqp-broker\]/a host=rabbitmq' ${CONFIG_PATH}/jasmin.cfg

EXPOSE 2775 8990 1401
VOLUME [${LOG_PATH}, ${CONFIG_PATH}, ${STORE_PATH}]

COPY docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes
# - restapi (0.9rc16+) is not started in this docker configuration

```

### jasmin/docker/Dockerfile.dev
```yaml
FROM python:3.11-slim-bullseye

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r jasmin && useradd -r -g jasmin jasmin

# Install requirements
RUN apt-get update && apt-get install -y \
    libffi-dev \
    libssl-dev \
    rabbitmq-server \
    redis-server \
    supervisor \
    # Run python with jemalloc
    # More on this:
    # - https://zapier.com/engineering/celery-python-jemalloc/
    # - https://paste.pics/581cc286226407ab0be400b94951a7d9
    libjemalloc2

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Run python with jemalloc
ENV LD_PRELOAD /usr/lib/x86_64-linux-gnu/libjemalloc.so.2

# Install Jasmin SMS gateway
RUN mkdir -p /etc/jasmin/resource \
    /etc/jasmin/store \
    /var/log/jasmin \
  && chown jasmin:jasmin /etc/jasmin/store \
    /var/log/jasmin 

WORKDIR /usr/jasmin

COPY jasmin jasmin
COPY requirements.txt .
COPY requirements-test.txt .
COPY setup.py .
COPY README.rst .

RUN pip install -r requirements.txt
RUN pip install -r requirements-test.txt
RUN pip install -e git+https://github.com/jookies/python-messaging.git@master#egg=python-messaging
RUN pip install -e git+https://github.com/jookies/smpp.pdu.git@master#egg=smpp.pdu3
RUN pip install -e git+https://github.com/jookies/smpp.twisted.git@master#egg=smpp.twisted3
RUN pip install .

ENV UNICODEMAP_JP unicode-ascii

ENV ROOT_PATH /
ENV CONFIG_PATH /etc/jasmin
ENV RESOURCE_PATH /etc/jasmin/resource
ENV STORE_PATH /etc/jasmin/store
ENV LOG_PATH /var/log/jasmin

COPY misc/config/*.cfg ${CONFIG_PATH}/
COPY misc/config/resource ${RESOURCE_PATH}

# Change binding host for jcli
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' ${CONFIG_PATH}/jasmin.cfg

COPY docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes
# - restapi (0.9rc16+) is not started in this docker configuration

```

### jasmin/docker/Dockerfile.full
```yaml
FROM python:3.11-slim-bullseye

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r jasmin && useradd -r -g jasmin jasmin

# Install requirements
RUN apt-get update && apt-get install -y \
    libffi-dev \
    libssl-dev \
    rabbitmq-server \
    redis-server \
    supervisor \
    # Run python with jemalloc
    # More on this:
    # - https://zapier.com/engineering/celery-python-jemalloc/
    # - https://paste.pics/581cc286226407ab0be400b94951a7d9
    libjemalloc2

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Run python with jemalloc
ENV LD_PRELOAD /usr/lib/x86_64-linux-gnu/libjemalloc.so.2

# Install Jasmin SMS gateway
RUN mkdir -p /etc/jasmin/resource \
    /etc/jasmin/store \
    /var/log/jasmin \
  && chown jasmin:jasmin /etc/jasmin/store \
    /var/log/jasmin 

WORKDIR /build

COPY . .

RUN pip install .

ENV UNICODEMAP_JP unicode-ascii

WORKDIR /usr/jasmin

# Change binding host for jcli
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' /etc/jasmin/jasmin.cfg

EXPOSE 2775 8990 1401
VOLUME ["/var/log/jasmin", "/etc/jasmin", "/etc/jasmin/store"]

COPY docker/full-docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes
# - restapi (0.9rc16+) is not started in this docker configuration

```

### jasmin/docker/Dockerfile.restapi
```yaml
FROM python:3.11-slim-bullseye

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r jasmin && useradd -r -g jasmin jasmin

# Install requirements
RUN apt-get update && apt-get install -y \
    libffi-dev \
    libssl-dev \
    # Run python with jemalloc
    # More on this:
    # - https://zapier.com/engineering/celery-python-jemalloc/
    # - https://paste.pics/581cc286226407ab0be400b94951a7d9
    libjemalloc2

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Run python with jemalloc
ENV LD_PRELOAD /usr/lib/x86_64-linux-gnu/libjemalloc.so.2

ENV ROOT_PATH /
ENV CONFIG_PATH /etc/jasmin
ENV RESOURCE_PATH ${CONFIG_PATH}/resource
ENV STORE_PATH ${CONFIG_PATH}/store
ENV LOG_PATH /var/log/jasmin

RUN mkdir -p ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}
RUN chown jasmin:jasmin ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}

WORKDIR /build

COPY . .

RUN pip install .

# For RestAPI MODE
RUN pip install gunicorn

ENV UNICODEMAP_JP unicode-ascii

COPY misc/config/*.cfg ${CONFIG_PATH}/
COPY misc/config/resource ${RESOURCE_PATH}

WORKDIR /etc/jasmin

# Default Redis and RabbitMQ connections
ENV AMQP_BROKER_HOST 'rabbitmq'
ENV AMQP_BROKER_PORT 5672
ENV REDIS_CLIENT_HOST 'redis'
ENV REDIS_CLIENT_PORT 6379

# For RestAPI MODE
ENV RESTAPI_MODE 0
ENV RESTAPI_OLD_HTTP_HOST '127.0.0.1'

ENV ENABLE_PUBLISH_SUBMIT_SM_RESP 0

# Change binding host for jcli
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' ${CONFIG_PATH}/jasmin.cfg
# Change binding port for redis, and amqp
RUN sed -i "/\[redis-client\]/a port=$REDIS_CLIENT_PORT" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a port=$AMQP_BROKER_PORT" ${CONFIG_PATH}/jasmin.cfg
# Change binding host for redis, and amqp
RUN sed -i "/\[redis-client\]/a host=$REDIS_CLIENT_HOST" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a host=$AMQP_BROKER_HOST" ${CONFIG_PATH}/jasmin.cfg

EXPOSE 2775 8990 1401 8080
VOLUME ["/var/log/jasmin", "/etc/jasmin", "/etc/jasmin/store"]

COPY docker/restapi-docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes

```

### jasmin/docker/Dockerfile.restapi.alpine
```yaml
FROM python:3.11-alpine

MAINTAINER Jookies LTD <jasmin@jookies.net>

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN addgroup -S jasmin && adduser -S -g jasmin jasmin

# Install requirements
RUN apk --update add \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    python3-dev \
    py3-pip \
    git \
    bash 

# For RestAPI MODE
ENV RESTAPI_MODE 0
ENV RESTAPI_OLD_HTTP_HOST '127.0.0.1'

ENV ENABLE_PUBLISH_SUBMIT_SM_RESP 0

ENV ROOT_PATH /
ENV CONFIG_PATH /etc/jasmin
ENV RESOURCE_PATH /etc/jasmin/resource
ENV STORE_PATH /etc/jasmin/store
ENV LOG_PATH /var/log/jasmin

RUN mkdir -p ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}
RUN chown jasmin:jasmin ${CONFIG_PATH} ${RESOURCE_PATH} ${STORE_PATH} ${LOG_PATH}

WORKDIR /build

RUN pip install -e git+https://github.com/jookies/txamqp.git@master#egg=txamqp3
RUN pip install -e git+https://github.com/jookies/python-messaging.git@master#egg=python-messaging
RUN pip install -e git+https://github.com/jookies/smpp.pdu.git@master#egg=smpp.pdu3
RUN pip install -e git+https://github.com/jookies/smpp.twisted.git@master#egg=smpp.twisted3

COPY . .

RUN pip install .

# For RestAPI MODE
RUN pip install gunicorn

ENV UNICODEMAP_JP unicode-ascii

COPY misc/config/*.cfg ${CONFIG_PATH}/
COPY misc/config/resource/*.xml ${RESOURCE_PATH}/

WORKDIR /etc/jasmin

# Change binding host for jcli
RUN sed -i '/\[jcli\]/a bind=0.0.0.0' ${CONFIG_PATH}/jasmin.cfg
# Change binding port for redis, and amqp
RUN sed -i "/\[redis-client\]/a port=$REDIS_CLIENT_PORT" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a port=$AMQP_BROKER_PORT" ${CONFIG_PATH}/jasmin.cfg
# Change binding host for redis, and amqp
RUN sed -i "/\[redis-client\]/a host=$REDIS_CLIENT_HOST" ${CONFIG_PATH}/jasmin.cfg
RUN sed -i "/\[amqp-broker\]/a host=$AMQP_BROKER_HOST" ${CONFIG_PATH}/jasmin.cfg

EXPOSE 2775 8990 1401 8080
VOLUME ["/var/log/jasmin", "/etc/jasmin", "/etc/jasmin/store"]

COPY docker/restapi-docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["jasmind.py", "--enable-interceptor-client", "--enable-dlr-thrower", "--enable-dlr-lookup", "-u", "jcliadmin", "-p", "jclipwd"]
# Notes:
# - jasmind is started with native dlr-thrower and dlr-lookup threads instead of standalone processes

```

### jasmin/docker-compose.grafana.yml
```yaml
version: "3.10"

services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    healthcheck:
      test: redis-cli ping | grep PONG
    deploy:
      resources:
        limits:
          cpus: '0.2'
          memory: 128M
    security_opt:
      - no-new-privileges:true

  rabbit-mq:
    image: rabbitmq:3.10-management-alpine
    restart: unless-stopped
    healthcheck:
      test: rabbitmq-diagnostics -q ping
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 525M
    security_opt:
      - no-new-privileges:true

  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    ports:
      - '9090:9090'
    volumes:
      - ./docker/prometheus/config/prometheus.yml:/etc/prometheus/prometheus.yml
      - monitoring_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    depends_on:
      - jasmin
    deploy:
      resources:
        limits:
          cpus: '0.2'
          memory: 128M
    security_opt:
      - no-new-privileges:true

  grafana:
    image: grafana/grafana
    restart: unless-stopped
    ports:
      - 3000:3000
    environment:
      GF_INSTALL_PLUGINS: "grafana-clock-panel,grafana-simple-json-datasource"
    volumes:
      - ./docker/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources:ro
      - ./docker/grafana/provisioning/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./docker/grafana/dashboards:/opt/grafana-dashboards:ro

      - monitoring_data:/var/lib/grafana
    depends_on:
      - prometheus
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
    security_opt:
      - no-new-privileges:true

  jasmin:
    build:
      context: ./
      dockerfile: ./docker/Dockerfile.dev
    restart: unless-stopped
    volumes:
      - ./jasmin:/usr/jasmin/jasmin
    ports:
      - 2775:2775
      - 8990:8990
      - 1401:1401
    depends_on:
      redis:
        condition: service_healthy
      rabbit-mq:
        condition: service_healthy
    environment:
      REDIS_CLIENT_HOST: redis
      AMQP_BROKER_HOST: rabbit-mq
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 256M
    security_opt:
      - no-new-privileges:true

volumes:
  monitoring_data: { }

```

### jasmin/docker-compose.restapi.yml
```yaml
version: "3"

services:
  redis:
    image: redis:7.0.5-alpine
    restart: always
    volumes:
      - redis:/data
    networks:
      - jasmin
    healthcheck:
      test: [ "CMD", "redis-cli", "--raw", "incr", "ping" ]
      retries: 3
      timeout: 5s

  rabbit-mq:
    image: rabbitmq:3.11.3-alpine
    restart: always
    volumes:
      - rabbitmq:/var/lib/rabbitmq
    networks:
      - jasmin
    healthcheck:
      test: [ "CMD", "rabbitmq-diagnostics", "-q", "ping" ]
      interval: 30s
      timeout: 30s
      retries: 3

  jasmin:
    build:
      context: ./
      dockerfile: ./docker/Dockerfile.restapi.alpine
    image: jasmin:restapi
    restart: always
    ports:
      - '${FORWARD_JASMIN_SMPP_PORT:-2775}:2775'
      - '${FORWARD_JASMIN_CLI_PORT:-8990}:8990'
      - '${FORWARD_JASMIN_HTTP_PORT:-1401}:1401'
    volumes:
      - jasmin_config:/etc/jasmin
      - jasmin_store:/etc/jasmin/store
      - jasmin_logs:/var/log/jasmin
    tmpfs:
      - /tmp
    networks:
      - jasmin
    depends_on:
      redis:
        condition: service_healthy
      rabbit-mq:
        condition: service_healthy
    environment:
      REDIS_CLIENT_HOST: ${REDIS_CLIENT_HOST:-redis}
      REDIS_CLIENT_PORT: ${REDIS_CLIENT_PORT:-6379}
      AMQP_BROKER_HOST: ${AMQP_BROKER_HOST:-rabbit-mq}
      AMQP_BROKER_PORT: ${AMQP_BROKER_PORT:-5672}
      ENABLE_PUBLISH_SUBMIT_SM_RESP: ${ENABLE_PUBLISH_SUBMIT_SM_RESP:-1}
      RESTAPI_MODE: ${RESTAPI_MODE:-0}
  

  jasmin-restapi:
    build:
      context: ./
      dockerfile: ./docker/Dockerfile.restapi
    image: jasmin:restapi
    restart: always
    ports:
      - '${FORWARD_JASMIN_RESTAPI_PORT:-8080}:8080'
    volumes:
      - restapi_logs:/var/log/jasmin
    tmpfs:
      - /tmp
    networks:
      - jasmin
    depends_on:
      - jasmin
    environment:
      REDIS_CLIENT_HOST: ${REDIS_CLIENT_HOST:-redis}
      REDIS_CLIENT_PORT: ${REDIS_CLIENT_PORT:-6379}
      AMQP_BROKER_HOST: ${AMQP_BROKER_HOST:-rabbit-mq}
      AMQP_BROKER_PORT: ${AMQP_BROKER_PORT:-5672}
      RESTAPI_MODE: ${RESTAPI_MODE:-1}
      RESTAPI_OLD_HTTP_HOST: ${RESTAPI_OLD_HTTP_HOST:-jasmin}

networks:
  jasmin:
    driver: bridge
volumes:
  jasmin_config: {}
  jasmin_store: {}
  jasmin_logs: {}
  restapi_logs: {}
  rabbitmq: {}
  redis: {}

```

### jasmin/docker-compose.yml
```yaml
version: "3.10"

services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    healthcheck:
      test: redis-cli ping | grep PONG
    deploy:
      resources:
        limits:
          cpus: '0.2'
          memory: 128M
    security_opt:
      - no-new-privileges:true

  rabbit-mq:
    image: rabbitmq:3.10-management-alpine
    restart: unless-stopped
    healthcheck:
      test: rabbitmq-diagnostics -q ping
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 525M
    security_opt:
      - no-new-privileges:true

  jasmin:
    build:
      context: ./
      dockerfile: ./docker/Dockerfile.dev
    restart: unless-stopped
    volumes:
      - ./jasmin:/usr/jasmin/jasmin
    ports:
      - 2775:2775
      - 8990:8990
      - 1401:1401
    depends_on:
      redis:
        condition: service_healthy
      rabbit-mq:
        condition: service_healthy
    environment:
      REDIS_CLIENT_HOST: redis
      AMQP_BROKER_HOST: rabbit-mq
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 256M
    security_opt:
      - no-new-privileges:true

```

## n8n

### n8n/.devcontainer/docker-compose.yml
```yaml
volumes:
  postgres-data:

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_PASSWORD=password

  n8n:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ..:/workspaces:cached
    command: sleep infinity
    environment:
      DB_POSTGRESDB_HOST: postgres
      DB_TYPE: postgresdb
      DB_POSTGRESDB_PASSWORD: password

```

### n8n/.devcontainer/Dockerfile
```yaml
FROM n8nio/base:24

RUN apk add --no-cache --update openssh sudo shadow bash
RUN echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node && chmod 0440 /etc/sudoers.d/node
RUN mkdir /workspaces && chown node:node /workspaces
RUN npm install -g pnpm

USER node
RUN mkdir -p ~/.pnpm-store && pnpm config set store-dir ~/.pnpm-store --global

```

### n8n/.github/docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - 5432:5432
    tmpfs:
      - /var/lib/postgresql/data

```

## traccar

### traccar/docker/Dockerfile.alpine
```yaml
FROM alpine AS package
ARG VERSION
COPY installers/traccar-other-$VERSION.zip /tmp/traccar.zip
RUN unzip -qo /tmp/traccar.zip -d /traccar

FROM eclipse-temurin:21-alpine AS jdk
RUN jlink --module-path $JAVA_HOME/jmods \
    --add-modules java.se,jdk.charsets,jdk.crypto.ec,jdk.unsupported \
    --strip-debug --no-header-files --no-man-pages --compress=2 --output /jre

FROM alpine:3.22
COPY --from=package /traccar /opt/traccar
COPY --from=jdk /jre /opt/traccar/jre
WORKDIR /opt/traccar
ENTRYPOINT ["/opt/traccar/jre/bin/java"]
CMD ["-jar", "tracker-server.jar", "conf/traccar.xml"]

```

### traccar/docker/Dockerfile.debian
```yaml
FROM alpine AS package
ARG VERSION
COPY installers/traccar-other-$VERSION.zip /tmp/traccar.zip
RUN unzip -qo /tmp/traccar.zip -d /traccar

FROM eclipse-temurin:21 AS jdk
RUN jlink --module-path $JAVA_HOME/jmods \
    --add-modules java.se,jdk.charsets,jdk.crypto.ec,jdk.unsupported \
    --strip-debug --no-header-files --no-man-pages --compress=2 --output /jre

FROM debian:12-slim
COPY --from=package /traccar /opt/traccar
COPY --from=jdk /jre /opt/traccar/jre
WORKDIR /opt/traccar
ENTRYPOINT ["/opt/traccar/jre/bin/java"]
CMD ["-jar", "tracker-server.jar", "conf/traccar.xml"]

```

### traccar/docker/Dockerfile.ubuntu
```yaml
FROM alpine AS package
ARG VERSION
COPY installers/traccar-other-$VERSION.zip /tmp/traccar.zip
RUN unzip -qo /tmp/traccar.zip -d /traccar

FROM eclipse-temurin:21-jammy AS jdk
RUN jlink --module-path $JAVA_HOME/jmods \
    --add-modules java.se,jdk.charsets,jdk.crypto.ec,jdk.unsupported \
    --strip-debug --no-header-files --no-man-pages --compress=2 --output /jre

FROM ubuntu:24.04
COPY --from=package /traccar /opt/traccar
COPY --from=jdk /jre /opt/traccar/jre
WORKDIR /opt/traccar
ENTRYPOINT ["/opt/traccar/jre/bin/java"]
CMD ["-jar", "tracker-server.jar", "conf/traccar.xml"]

```

## twenty

### twenty/.cursor/Dockerfile
```yaml
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    make \
    build-essential \
    postgresql-client \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install nvm (project recommends nvm + .nvmrc for consistent Node versions)
ENV NVM_DIR=/usr/local/nvm
RUN mkdir -p $NVM_DIR \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

SHELL ["/bin/bash", "-c"]

# Copy .nvmrc so nvm install picks up the right version
COPY .nvmrc /tmp/.nvmrc

# Install Node.js from .nvmrc, enable Corepack, and symlink binaries
# so they're available on PATH without hardcoding a version
RUN . $NVM_DIR/nvm.sh \
    && nvm install $(cat /tmp/.nvmrc) \
    && nvm alias default $(cat /tmp/.nvmrc) \
    && corepack enable \
    && BIN_DIR=$(dirname $(nvm which default)) \
    && ln -sf $BIN_DIR/node /usr/local/bin/node \
    && ln -sf $BIN_DIR/npm /usr/local/bin/npm \
    && ln -sf $BIN_DIR/npx /usr/local/bin/npx \
    && ln -sf $BIN_DIR/corepack /usr/local/bin/corepack

```

### twenty/packages/twenty-docker/docker-compose.yml
```yaml
name: twenty

services:
  server:
    image: twentycrm/twenty:${TAG:-latest}
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    ports:
      - "3000:3000"
    environment:
      NODE_PORT: 3000
      PG_DATABASE_URL: postgres://${PG_DATABASE_USER:-postgres}:${PG_DATABASE_PASSWORD:-postgres}@${PG_DATABASE_HOST:-db}:${PG_DATABASE_PORT:-5432}/default
      SERVER_URL: ${SERVER_URL}
      REDIS_URL: ${REDIS_URL:-redis://redis:6379}
      DISABLE_DB_MIGRATIONS: ${DISABLE_DB_MIGRATIONS}
      DISABLE_CRON_JOBS_REGISTRATION: ${DISABLE_CRON_JOBS_REGISTRATION}

      STORAGE_TYPE: ${STORAGE_TYPE}
      STORAGE_S3_REGION: ${STORAGE_S3_REGION}
      STORAGE_S3_NAME: ${STORAGE_S3_NAME}
      STORAGE_S3_ENDPOINT: ${STORAGE_S3_ENDPOINT}

      APP_SECRET: ${APP_SECRET:-replace_me_with_a_random_string}
      # MESSAGING_PROVIDER_GMAIL_ENABLED: ${MESSAGING_PROVIDER_GMAIL_ENABLED}
      # CALENDAR_PROVIDER_GOOGLE_ENABLED: ${CALENDAR_PROVIDER_GOOGLE_ENABLED}
      # AUTH_GOOGLE_CLIENT_ID: ${AUTH_GOOGLE_CLIENT_ID}
      # AUTH_GOOGLE_CLIENT_SECRET: ${AUTH_GOOGLE_CLIENT_SECRET}
      # AUTH_GOOGLE_CALLBACK_URL: ${AUTH_GOOGLE_CALLBACK_URL}
      # AUTH_GOOGLE_APIS_CALLBACK_URL: ${AUTH_GOOGLE_APIS_CALLBACK_URL}

      # CALENDAR_PROVIDER_MICROSOFT_ENABLED: ${CALENDAR_PROVIDER_MICROSOFT_ENABLED}
      # MESSAGING_PROVIDER_MICROSOFT_ENABLED: ${MESSAGING_PROVIDER_MICROSOFT_ENABLED}
      # AUTH_MICROSOFT_ENABLED: ${AUTH_MICROSOFT_ENABLED}
      # AUTH_MICROSOFT_CLIENT_ID: ${AUTH_MICROSOFT_CLIENT_ID}
      # AUTH_MICROSOFT_CLIENT_SECRET: ${AUTH_MICROSOFT_CLIENT_SECRET}
      # AUTH_MICROSOFT_CALLBACK_URL: ${AUTH_MICROSOFT_CALLBACK_URL}
      # AUTH_MICROSOFT_APIS_CALLBACK_URL: ${AUTH_MICROSOFT_APIS_CALLBACK_URL}

      # EMAIL_FROM_ADDRESS: ${EMAIL_FROM_ADDRESS:-contact@yourdomain.com}
      # EMAIL_FROM_NAME: ${EMAIL_FROM_NAME:-"John from YourDomain"}
      # EMAIL_SYSTEM_ADDRESS: ${EMAIL_SYSTEM_ADDRESS:-system@yourdomain.com}
      # EMAIL_DRIVER: ${EMAIL_DRIVER:-smtp}
      # EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST:-smtp.gmail.com}
      # EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT:-465}
      # EMAIL_SMTP_USER: ${EMAIL_SMTP_USER:-}
      # EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD:-}

    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: curl --fail http://localhost:3000/healthz
      interval: 5s
      timeout: 5s
      retries: 20
    restart: always

  worker:
    image: twentycrm/twenty:${TAG:-latest}
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    command: ["yarn", "worker:prod"]
    environment:
      PG_DATABASE_URL: postgres://${PG_DATABASE_USER:-postgres}:${PG_DATABASE_PASSWORD:-postgres}@${PG_DATABASE_HOST:-db}:${PG_DATABASE_PORT:-5432}/default
      SERVER_URL: ${SERVER_URL}
      REDIS_URL: ${REDIS_URL:-redis://redis:6379}
      DISABLE_DB_MIGRATIONS: "true" # it already runs on the server
      DISABLE_CRON_JOBS_REGISTRATION: "true" # it already runs on the server

      STORAGE_TYPE: ${STORAGE_TYPE}
      STORAGE_S3_REGION: ${STORAGE_S3_REGION}
      STORAGE_S3_NAME: ${STORAGE_S3_NAME}
      STORAGE_S3_ENDPOINT: ${STORAGE_S3_ENDPOINT}

      APP_SECRET: ${APP_SECRET:-replace_me_with_a_random_string}
      # MESSAGING_PROVIDER_GMAIL_ENABLED: ${MESSAGING_PROVIDER_GMAIL_ENABLED}
      # CALENDAR_PROVIDER_GOOGLE_ENABLED: ${CALENDAR_PROVIDER_GOOGLE_ENABLED}
      # AUTH_GOOGLE_CLIENT_ID: ${AUTH_GOOGLE_CLIENT_ID}
      # AUTH_GOOGLE_CLIENT_SECRET: ${AUTH_GOOGLE_CLIENT_SECRET}
      # AUTH_GOOGLE_CALLBACK_URL: ${AUTH_GOOGLE_CALLBACK_URL}
      # AUTH_GOOGLE_APIS_CALLBACK_URL: ${AUTH_GOOGLE_APIS_CALLBACK_URL}

      # CALENDAR_PROVIDER_MICROSOFT_ENABLED: ${CALENDAR_PROVIDER_MICROSOFT_ENABLED}
      # MESSAGING_PROVIDER_MICROSOFT_ENABLED: ${MESSAGING_PROVIDER_MICROSOFT_ENABLED}
      # AUTH_MICROSOFT_ENABLED: ${AUTH_MICROSOFT_ENABLED}
      # AUTH_MICROSOFT_CLIENT_ID: ${AUTH_MICROSOFT_CLIENT_ID}
      # AUTH_MICROSOFT_CLIENT_SECRET: ${AUTH_MICROSOFT_CLIENT_SECRET}
      # AUTH_MICROSOFT_CALLBACK_URL: ${AUTH_MICROSOFT_CALLBACK_URL}
      # AUTH_MICROSOFT_APIS_CALLBACK_URL: ${AUTH_MICROSOFT_APIS_CALLBACK_URL}

      # EMAIL_FROM_ADDRESS: ${EMAIL_FROM_ADDRESS:-contact@yourdomain.com}
      # EMAIL_FROM_NAME: ${EMAIL_FROM_NAME:-"John from YourDomain"}
      # EMAIL_SYSTEM_ADDRESS: ${EMAIL_SYSTEM_ADDRESS:-system@yourdomain.com}
      # EMAIL_DRIVER: ${EMAIL_DRIVER:-smtp}
      # EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST:-smtp.gmail.com}
      # EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT:-465}
      # EMAIL_SMTP_USER: ${EMAIL_SMTP_USER:-}
      # EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD:-}

    depends_on:
      db:
        condition: service_healthy
      server:
        condition: service_healthy
    restart: always

  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${PG_DATABASE_NAME:-default}
      POSTGRES_PASSWORD: ${PG_DATABASE_PASSWORD:-postgres}
      POSTGRES_USER: ${PG_DATABASE_USER:-postgres}
    healthcheck:
      test: pg_isready -U ${PG_DATABASE_USER:-postgres} -h localhost -d postgres
      interval: 5s
      timeout: 5s
      retries: 10
    restart: always

  redis:
    image: redis
    restart: always
    command: ["--maxmemory-policy", "noeviction"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  db-data:
  server-local-data:

```

## mailcow-dockerized

### mailcow-dockerized/docker-compose.yml
```yaml
services:

    unbound-mailcow:
      image: ghcr.io/mailcow/unbound:1.24
      environment:
        - TZ=${TZ}
        - SKIP_UNBOUND_HEALTHCHECK=${SKIP_UNBOUND_HEALTHCHECK:-n}
      volumes:
        - ./data/hooks/unbound:/hooks:Z
        - ./data/conf/unbound/unbound.conf:/etc/unbound/unbound.conf:ro,Z
      restart: always
      tty: true
      networks:
        mailcow-network:
          ipv4_address: ${IPV4_NETWORK:-172.22.1}.254
          aliases:
            - unbound

    mysql-mailcow:
      image: mariadb:10.11
      depends_on:
        - unbound-mailcow
        - netfilter-mailcow
      stop_grace_period: 45s
      volumes:
        - mysql-vol-1:/var/lib/mysql/
        - mysql-socket-vol-1:/var/run/mysqld/:z
        - ./data/conf/mysql/:/etc/mysql/conf.d/:ro,Z
      environment:
        - TZ=${TZ}
        - MYSQL_ROOT_PASSWORD=${DBROOT}
        - MYSQL_DATABASE=${DBNAME}
        - MYSQL_USER=${DBUSER}
        - MYSQL_PASSWORD=${DBPASS}
        - MYSQL_INITDB_SKIP_TZINFO=1
      restart: always
      ports:
        - "${SQL_PORT:-127.0.0.1:13306}:3306"
      networks:
        mailcow-network:
          aliases:
            - mysql

    redis-mailcow:
      image: redis:7.4.6-alpine
      entrypoint: ["/bin/sh","/redis-conf.sh"]
      volumes:
        - redis-vol-1:/data/
        - ./data/conf/redis/redis-conf.sh:/redis-conf.sh:z
      restart: always
      depends_on:
        - netfilter-mailcow
      ports:
        - "${REDIS_PORT:-127.0.0.1:7654}:6379"
      environment:
        - TZ=${TZ}
        - REDISPASS=${REDISPASS}
        - REDISMASTERPASS=${REDISMASTERPASS:-}
      sysctls:
        - net.core.somaxconn=4096
      networks:
        mailcow-network:
          ipv4_address: ${IPV4_NETWORK:-172.22.1}.249
          aliases:
            - redis

    clamd-mailcow:
      image: ghcr.io/mailcow/clamd:1.71
      restart: always
      depends_on:
        unbound-mailcow:
          condition: service_healthy
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      environment:
        - TZ=${TZ}
        - SKIP_CLAMD=${SKIP_CLAMD:-n}
      volumes:
        - ./data/conf/clamav/:/etc/clamav/:Z
        - clamd-db-vol-1:/var/lib/clamav
      networks:
        mailcow-network:
          aliases:
            - clamd

    rspamd-mailcow:
      image: ghcr.io/mailcow/rspamd:3.14.2
      stop_grace_period: 30s
      depends_on:
        - dovecot-mailcow
        - clamd-mailcow
      environment:
        - TZ=${TZ}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - IPV6_NETWORK=${IPV6_NETWORK:-fd4d:6169:6c63:6f77::/64}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - SPAMHAUS_DQS_KEY=${SPAMHAUS_DQS_KEY:-}
      volumes:
        - ./data/hooks/rspamd:/hooks:Z
        - ./data/conf/rspamd/custom/:/etc/rspamd/custom:z
        - ./data/conf/rspamd/override.d/:/etc/rspamd/override.d:Z
        - ./data/conf/rspamd/local.d/:/etc/rspamd/local.d:Z
        - ./data/conf/rspamd/plugins.d/:/etc/rspamd/plugins.d:Z
        - ./data/conf/rspamd/lua/:/etc/rspamd/lua/:ro,Z
        - ./data/conf/rspamd/rspamd.conf.local:/etc/rspamd/rspamd.conf.local:Z
        - ./data/conf/rspamd/rspamd.conf.override:/etc/rspamd/rspamd.conf.override:Z
        - rspamd-vol-1:/var/lib/rspamd
      restart: always
      hostname: rspamd
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      networks:
        mailcow-network:
          aliases:
            - rspamd

    php-fpm-mailcow:
      image: ghcr.io/mailcow/phpfpm:8.2.29-1
      command: "php-fpm -d date.timezone=${TZ} -d expose_php=0"
      depends_on:
        - redis-mailcow
      volumes:
        - ./data/hooks/phpfpm:/hooks:Z
        - ./data/web:/web:z
        - ./data/conf/rspamd/dynmaps:/dynmaps:ro,z
        - ./data/conf/rspamd/custom/:/rspamd_custom_maps:z
        - ./data/conf/dovecot/auth/mailcowauth.php:/mailcowauth/mailcowauth.php:z
        - ./data/web/inc/functions.inc.php:/mailcowauth/functions.inc.php:z
        - ./data/web/inc/functions.auth.inc.php:/mailcowauth/functions.auth.inc.php:z
        - ./data/web/inc/sessions.inc.php:/mailcowauth/sessions.inc.php:z
        - ./data/web/inc/functions.mailbox.inc.php:/mailcowauth/functions.mailbox.inc.php:z
        - ./data/web/inc/functions.ratelimit.inc.php:/mailcowauth/functions.ratelimit.inc.php:z
        - ./data/web/inc/functions.acl.inc.php:/mailcowauth/functions.acl.inc.php:z
        - rspamd-vol-1:/var/lib/rspamd
        - mysql-socket-vol-1:/var/run/mysqld/:z
        - ./data/conf/sogo/:/etc/sogo/:z
        - ./data/conf/rspamd/meta_exporter:/meta_exporter:ro,z
        - ./data/conf/phpfpm/crons:/crons:z
        - ./data/conf/phpfpm/sogo-sso/:/etc/sogo-sso/:z
        - ./data/conf/phpfpm/php-fpm.d/pools.conf:/usr/local/etc/php-fpm.d/z-pools.conf:Z
        - ./data/conf/phpfpm/php-conf.d/opcache-recommended.ini:/usr/local/etc/php/conf.d/opcache-recommended.ini:Z
        - ./data/conf/phpfpm/php-conf.d/upload.ini:/usr/local/etc/php/conf.d/upload.ini:Z
        - ./data/conf/phpfpm/php-conf.d/other.ini:/usr/local/etc/php/conf.d/zzz-other.ini:Z
        - ./data/conf/dovecot/global_sieve_before:/global_sieve/before:z
        - ./data/conf/dovecot/global_sieve_after:/global_sieve/after:z
        - ./data/assets/templates:/tpls:z
        - ./data/conf/nginx/:/etc/nginx/conf.d/:z
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      environment:
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - LOG_LINES=${LOG_LINES:-9999}
        - TZ=${TZ}
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - MAILCOW_PASS_SCHEME=${MAILCOW_PASS_SCHEME:-BLF-CRYPT}
        - IMAP_PORT=${IMAP_PORT:-143}
        - IMAPS_PORT=${IMAPS_PORT:-993}
        - POP_PORT=${POP_PORT:-110}
        - POPS_PORT=${POPS_PORT:-995}
        - SIEVE_PORT=${SIEVE_PORT:-4190}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - IPV6_NETWORK=${IPV6_NETWORK:-fd4d:6169:6c63:6f77::/64}
        - SUBMISSION_PORT=${SUBMISSION_PORT:-587}
        - SMTPS_PORT=${SMTPS_PORT:-465}
        - SMTP_PORT=${SMTP_PORT:-25}
        - API_KEY=${API_KEY:-invalid}
        - API_KEY_READ_ONLY=${API_KEY_READ_ONLY:-invalid}
        - API_ALLOW_FROM=${API_ALLOW_FROM:-invalid}
        - COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-mailcow-dockerized}
        - SKIP_FTS=${SKIP_FTS:-y}
        - SKIP_CLAMD=${SKIP_CLAMD:-n}
        - SKIP_OLEFY=${SKIP_OLEFY:-n}
        - SKIP_SOGO=${SKIP_SOGO:-n}
        - ALLOW_ADMIN_EMAIL_LOGIN=${ALLOW_ADMIN_EMAIL_LOGIN:-n}
        - MASTER=${MASTER:-y}
        - DEV_MODE=${DEV_MODE:-n}
        - DEMO_MODE=${DEMO_MODE:-n}
        - WEBAUTHN_ONLY_TRUSTED_VENDORS=${WEBAUTHN_ONLY_TRUSTED_VENDORS:-n}
        - CLUSTERMODE=${CLUSTERMODE:-}
        - ADDITIONAL_SERVER_NAMES=${ADDITIONAL_SERVER_NAMES:-}
      restart: always
      labels:
        ofelia.enabled: "true"
        ofelia.job-exec.phpfpm_keycloak_sync.schedule: "0 * * * * *"
        ofelia.job-exec.phpfpm_keycloak_sync.no-overlap: "true"
        ofelia.job-exec.phpfpm_keycloak_sync.command: "/bin/bash -c \"php /crons/keycloak-sync.php || exit 0\""
        ofelia.job-exec.phpfpm_ldap_sync.schedule: "0 * * * * *"
        ofelia.job-exec.phpfpm_ldap_sync.no-overlap: "true"
        ofelia.job-exec.phpfpm_ldap_sync.command: "/bin/bash -c \"php /crons/ldap-sync.php || exit 0\""
      networks:
        mailcow-network:
          aliases:
            - phpfpm

    sogo-mailcow:
      image: ghcr.io/mailcow/sogo:5.12.4-1
      environment:
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - TZ=${TZ}
        - LOG_LINES=${LOG_LINES:-9999}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - MAILCOW_PASS_SCHEME=${MAILCOW_PASS_SCHEME:-BLF-CRYPT}
        - ACL_ANYONE=${ACL_ANYONE:-disallow}
        - ALLOW_ADMIN_EMAIL_LOGIN=${ALLOW_ADMIN_EMAIL_LOGIN:-n}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - SOGO_EXPIRE_SESSION=${SOGO_EXPIRE_SESSION:-480}
        - SOGO_URL_ENCRYPTION_KEY=${SOGO_URL_ENCRYPTION_KEY:-SOGoSuperSecret0}
        - SKIP_SOGO=${SKIP_SOGO:-n}
        - MASTER=${MASTER:-y}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      volumes:
        - ./data/hooks/sogo:/hooks:Z
        - ./data/conf/sogo/:/etc/sogo/:z
        - ./data/web/inc/init_db.inc.php:/init_db.inc.php:z
        - ./data/conf/sogo/custom-favicon.ico:/usr/lib/GNUstep/SOGo/WebServerResources/img/sogo.ico:z
        - ./data/conf/sogo/custom-shortlogo.svg:/usr/lib/GNUstep/SOGo/WebServerResources/img/sogo-compact.svg:z
        - ./data/conf/sogo/custom-fulllogo.svg:/usr/lib/GNUstep/SOGo/WebServerResources/img/sogo-full.svg:z
        - ./data/conf/sogo/custom-fulllogo.png:/usr/lib/GNUstep/SOGo/WebServerResources/img/sogo-logo.png:z
        - ./data/conf/sogo/custom-theme.js:/usr/lib/GNUstep/SOGo/WebServerResources/js/theme.js:z
        - ./data/conf/sogo/custom-sogo.js:/usr/lib/GNUstep/SOGo/WebServerResources/js/custom-sogo.js:z
        - mysql-socket-vol-1:/var/run/mysqld/:z
        - sogo-web-vol-1:/sogo_web
        - sogo-userdata-backup-vol-1:/sogo_backup
      labels:
        ofelia.enabled: "true"
        ofelia.job-exec.sogo_sessions.schedule: "0 * * * * *"
        ofelia.job-exec.sogo_sessions.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu sogo /usr/sbin/sogo-tool -v expire-sessions $${SOGO_EXPIRE_SESSION} || exit 0\""
        ofelia.job-exec.sogo_ealarms.schedule: "0 * * * * *"
        ofelia.job-exec.sogo_ealarms.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu sogo /usr/sbin/sogo-ealarms-notify -p /etc/sogo/cron.creds || exit 0\""
        ofelia.job-exec.sogo_eautoreply.schedule: "0 */5 * * * *"
        ofelia.job-exec.sogo_eautoreply.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu sogo /usr/sbin/sogo-tool update-autoreply -p /etc/sogo/sieve.creds || exit 0\""
        ofelia.job-exec.sogo_backup.schedule: "0 0 0 * * *"
        ofelia.job-exec.sogo_backup.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu sogo /usr/sbin/sogo-tool backup /sogo_backup ALL || exit 0\""
      restart: always
      networks:
        mailcow-network:
          ipv4_address: ${IPV4_NETWORK:-172.22.1}.248
          aliases:
            - sogo

    dovecot-mailcow:
      image: ghcr.io/mailcow/dovecot:2.3.21.1-1
      depends_on:
        - mysql-mailcow
        - netfilter-mailcow
        - redis-mailcow
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      cap_add:
        - NET_BIND_SERVICE
      volumes:
        - ./data/hooks/dovecot:/hooks:Z
        - ./data/conf/dovecot:/etc/dovecot:z
        - ./data/assets/ssl:/etc/ssl/mail/:ro,z
        - ./data/conf/sogo/:/etc/sogo/:z
        - ./data/conf/phpfpm/sogo-sso/:/etc/phpfpm/:z
        - vmail-vol-1:/var/vmail
        - vmail-index-vol-1:/var/vmail_index
        - crypt-vol-1:/mail_crypt/
        - ./data/conf/rspamd/custom/:/etc/rspamd/custom:z
        - ./data/assets/templates:/templates:z
        - rspamd-vol-1:/var/lib/rspamd
        - mysql-socket-vol-1:/var/run/mysqld/:z
      environment:
        - DOVECOT_MASTER_USER=${DOVECOT_MASTER_USER:-}
        - DOVECOT_MASTER_PASS=${DOVECOT_MASTER_PASS:-}
        - MAILCOW_REPLICA_IP=${MAILCOW_REPLICA_IP:-}
        - DOVEADM_REPLICA_PORT=${DOVEADM_REPLICA_PORT:-}
        - LOG_LINES=${LOG_LINES:-9999}
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - TZ=${TZ}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - MAILCOW_PASS_SCHEME=${MAILCOW_PASS_SCHEME:-BLF-CRYPT}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - ALLOW_ADMIN_EMAIL_LOGIN=${ALLOW_ADMIN_EMAIL_LOGIN:-n}
        - MAILDIR_GC_TIME=${MAILDIR_GC_TIME:-7200}
        - ACL_ANYONE=${ACL_ANYONE:-disallow}
        - SKIP_FTS=${SKIP_FTS:-y}
        - FTS_HEAP=${FTS_HEAP:-512}
        - FTS_PROCS=${FTS_PROCS:-3}
        - MAILDIR_SUB=${MAILDIR_SUB:-}
        - MASTER=${MASTER:-y}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-mailcow-dockerized}
      ports:
        - "${DOVEADM_PORT:-127.0.0.1:19991}:12345"
        - "${IMAP_PORT:-143}:143"
        - "${IMAPS_PORT:-993}:993"
        - "${POP_PORT:-110}:110"
        - "${POPS_PORT:-995}:995"
        - "${SIEVE_PORT:-4190}:4190"
      restart: always
      tty: true
      labels:
        ofelia.enabled: "true"
        ofelia.job-exec.dovecot_imapsync_runner.schedule: "0 * * * * *"
        ofelia.job-exec.dovecot_imapsync_runner.no-overlap: "true"
        ofelia.job-exec.dovecot_imapsync_runner.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu nobody /usr/local/bin/imapsync_runner.pl || exit 0\""
        ofelia.job-exec.dovecot_trim_logs.schedule: "0 * * * * *"
        ofelia.job-exec.dovecot_trim_logs.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu vmail /usr/local/bin/trim_logs.sh || exit 0\""
        ofelia.job-exec.dovecot_quarantine.schedule: "0 */20 * * * *"
        ofelia.job-exec.dovecot_quarantine.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu vmail /usr/local/bin/quarantine_notify.py || exit 0\""
        ofelia.job-exec.dovecot_clean_q_aged.schedule: "0 0 0 * * *"
        ofelia.job-exec.dovecot_clean_q_aged.command: "/bin/bash -c \"[[ $${MASTER} == y ]] && /usr/local/bin/gosu vmail /usr/local/bin/clean_q_aged.sh || exit 0\""
        ofelia.job-exec.dovecot_maildir_gc.schedule: "0 */30 * * * *"
        ofelia.job-exec.dovecot_maildir_gc.command: "/bin/bash -c \"source /source_env.sh ; /usr/local/bin/gosu vmail /usr/local/bin/maildir_gc.sh\""
        ofelia.job-exec.dovecot_sarules.schedule: "@every 24h"
        ofelia.job-exec.dovecot_sarules.command: "/bin/bash -c \"/usr/local/bin/sa-rules.sh\""
        ofelia.job-exec.dovecot_fts.schedule: "0 0 0 * * *"
        ofelia.job-exec.dovecot_fts.command: "/bin/bash -c \"/usr/local/bin/gosu vmail /usr/local/bin/optimize-fts.sh\""
        ofelia.job-exec.dovecot_repl_health.schedule: "0 */5 * * * *"
        ofelia.job-exec.dovecot_repl_health.command: "/bin/bash -c \"/usr/local/bin/gosu vmail /usr/local/bin/repl_health.sh\""
      ulimits:
        nproc: 65535
        nofile:
          soft: 20000
          hard: 40000
      networks:
        mailcow-network:
          ipv4_address: ${IPV4_NETWORK:-172.22.1}.250
          aliases:
            - dovecot

    postfix-mailcow:
      image: ghcr.io/mailcow/postfix:3.7.11-1
      depends_on:
        mysql-mailcow:
          condition: service_started
        unbound-mailcow:
          condition: service_healthy
        postfix-tlspol-mailcow:
          condition: service_started
      volumes:
        - ./data/hooks/postfix:/hooks:Z
        - ./data/conf/postfix:/opt/postfix/conf:z
        - ./data/assets/ssl:/etc/ssl/mail/:ro,z
        - postfix-vol-1:/var/spool/postfix
        - crypt-vol-1:/var/lib/zeyple
        - rspamd-vol-1:/var/lib/rspamd
        - mysql-socket-vol-1:/var/run/mysqld/:z
      environment:
        - LOG_LINES=${LOG_LINES:-9999}
        - TZ=${TZ}
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - SPAMHAUS_DQS_KEY=${SPAMHAUS_DQS_KEY:-}
      cap_add:
        - NET_BIND_SERVICE
      ports:
        - "${SMTP_PORT:-25}:25"
        - "${SMTPS_PORT:-465}:465"
        - "${SUBMISSION_PORT:-587}:587"
      restart: always
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      networks:
        mailcow-network:
          ipv4_address: ${IPV4_NETWORK:-172.22.1}.253
          aliases:
            - postfix

    postfix-tlspol-mailcow:
      image: ghcr.io/mailcow/postfix-tlspol:1.8.22
      depends_on:
        unbound-mailcow:
          condition: service_healthy
      volumes:
        - postfix-tlspol-vol-1:/var/lib/postfix-tlspol
      environment:
        - LOG_LINES=${LOG_LINES:-9999}
        - TZ=${TZ}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - DEV_MODE=${DEV_MODE:-n}
      restart: always
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      networks:
        mailcow-network:
          aliases:
            - postfix-tlspol

    memcached-mailcow:
      image: memcached:alpine
      restart: always
      environment:
        - TZ=${TZ}
      networks:
        mailcow-network:
          aliases:
            - memcached

    nginx-mailcow:
      depends_on:
        - redis-mailcow
        - php-fpm-mailcow
        - sogo-mailcow
        - rspamd-mailcow
      image: ghcr.io/mailcow/nginx:1.05
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      environment:
        - HTTPS_PORT=${HTTPS_PORT:-443}
        - HTTP_PORT=${HTTP_PORT:-80}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - ADDITIONAL_SERVER_NAMES=${ADDITIONAL_SERVER_NAMES:-}
        - TZ=${TZ}
        - SKIP_SOGO=${SKIP_SOGO:-n}
        - SKIP_RSPAMD=${SKIP_RSPAMD:-n}
        - ENABLE_IPV6=${ENABLE_IPV6:-true}
        - HTTP_REDIRECT=${HTTP_REDIRECT:-n}
        - PHPFPMHOST=${PHPFPMHOST:-}
        - SOGOHOST=${SOGOHOST:-}
        - RSPAMDHOST=${RSPAMDHOST:-}
        - REDISHOST=${REDISHOST:-}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - NGINX_USE_PROXY_PROTOCOL=${NGINX_USE_PROXY_PROTOCOL:-n}
        - TRUSTED_PROXIES=${TRUSTED_PROXIES:-}
      volumes:
        - ./data/web:/web:ro,z
        - ./data/conf/rspamd/dynmaps:/dynmaps:ro,z
        - ./data/assets/ssl/:/etc/ssl/mail/:ro,z
        - ./data/conf/nginx/:/etc/nginx/conf.d/:z
        - ./data/conf/rspamd/meta_exporter:/meta_exporter:ro,z
        - ./data/conf/dovecot/auth/mailcowauth.php:/mailcowauth/mailcowauth.php:z
        - ./data/web/inc/functions.inc.php:/mailcowauth/functions.inc.php:z
        - ./data/web/inc/functions.auth.inc.php:/mailcowauth/functions.auth.inc.php:z
        - ./data/web/inc/sessions.inc.php:/mailcowauth/sessions.inc.php:z
        - sogo-web-vol-1:/usr/lib/GNUstep/SOGo/
      ports:
        - "${HTTPS_BIND:-}:${HTTPS_PORT:-443}:${HTTPS_PORT:-443}"
        - "${HTTP_BIND:-}:${HTTP_PORT:-80}:${HTTP_PORT:-80}"
      restart: always
      networks:
        mailcow-network:
          aliases:
            - nginx

    acme-mailcow:
      depends_on:
        nginx-mailcow:
          condition: service_started
        unbound-mailcow:
          condition: service_healthy
      image: ghcr.io/mailcow/acme:1.95
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      environment:
        - LOG_LINES=${LOG_LINES:-9999}
        - ADDITIONAL_SAN=${ADDITIONAL_SAN}
        - AUTODISCOVER_SAN=${AUTODISCOVER_SAN:-y}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - SKIP_LETS_ENCRYPT=${SKIP_LETS_ENCRYPT:-n}
        - COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-mailcow-dockerized}
        - DIRECTORY_URL=${DIRECTORY_URL:-}
        - ENABLE_SSL_SNI=${ENABLE_SSL_SNI:-n}
        - SKIP_IP_CHECK=${SKIP_IP_CHECK:-n}
        - SKIP_HTTP_VERIFICATION=${SKIP_HTTP_VERIFICATION:-n}
        - ONLY_MAILCOW_HOSTNAME=${ONLY_MAILCOW_HOSTNAME:-n}
        - LE_STAGING=${LE_STAGING:-n}
        - TZ=${TZ}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - SNAT_TO_SOURCE=${SNAT_TO_SOURCE:-n}
        - SNAT6_TO_SOURCE=${SNAT6_TO_SOURCE:-n}
      volumes:
        - ./data/web/.well-known/acme-challenge:/var/www/acme:z
        - ./data/assets/ssl:/var/lib/acme/:z
        - ./data/assets/ssl-example:/var/lib/ssl-example/:ro,Z
        - mysql-socket-vol-1:/var/run/mysqld/:z
      restart: always
      networks:
        mailcow-network:
          aliases:
            - acme

    netfilter-mailcow:
      image: ghcr.io/mailcow/netfilter:1.63
      stop_grace_period: 30s
      restart: always
      privileged: true
      environment:
        - TZ=${TZ}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - IPV6_NETWORK=${IPV6_NETWORK:-fd4d:6169:6c63:6f77::/64}
        - SNAT_TO_SOURCE=${SNAT_TO_SOURCE:-n}
        - SNAT6_TO_SOURCE=${SNAT6_TO_SOURCE:-n}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - MAILCOW_REPLICA_IP=${MAILCOW_REPLICA_IP:-}
        - DISABLE_NETFILTER_ISOLATION_RULE=${DISABLE_NETFILTER_ISOLATION_RULE:-n}
      network_mode: "host"
      volumes:
        - /lib/modules:/lib/modules:ro

    watchdog-mailcow:
      image: ghcr.io/mailcow/watchdog:2.09
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      tmpfs:
        - /tmp
      volumes:
        - rspamd-vol-1:/var/lib/rspamd
        - mysql-socket-vol-1:/var/run/mysqld/:z
        - postfix-vol-1:/var/spool/postfix
        - ./data/assets/ssl:/etc/ssl/mail/:ro,z
      restart: always
      depends_on:
        - postfix-mailcow
        - dovecot-mailcow
        - mysql-mailcow
        - acme-mailcow
        - redis-mailcow
      environment:
        - IPV6_NETWORK=${IPV6_NETWORK:-fd4d:6169:6c63:6f77::/64}
        - LOG_LINES=${LOG_LINES:-9999}
        - TZ=${TZ}
        - DBNAME=${DBNAME}
        - DBUSER=${DBUSER}
        - DBPASS=${DBPASS}
        - DBROOT=${DBROOT}
        - USE_WATCHDOG=${USE_WATCHDOG:-n}
        - WATCHDOG_NOTIFY_EMAIL=${WATCHDOG_NOTIFY_EMAIL:-}
        - WATCHDOG_NOTIFY_BAN=${WATCHDOG_NOTIFY_BAN:-y}
        - WATCHDOG_NOTIFY_START=${WATCHDOG_NOTIFY_START:-y}
        - WATCHDOG_SUBJECT=${WATCHDOG_SUBJECT:-Watchdog ALERT}
        - WATCHDOG_NOTIFY_WEBHOOK=${WATCHDOG_NOTIFY_WEBHOOK:-}
        - WATCHDOG_NOTIFY_WEBHOOK_BODY=${WATCHDOG_NOTIFY_WEBHOOK_BODY:-}
        - WATCHDOG_EXTERNAL_CHECKS=${WATCHDOG_EXTERNAL_CHECKS:-n}
        - WATCHDOG_MYSQL_REPLICATION_CHECKS=${WATCHDOG_MYSQL_REPLICATION_CHECKS:-n}
        - WATCHDOG_VERBOSE=${WATCHDOG_VERBOSE:-n}
        - MAILCOW_HOSTNAME=${MAILCOW_HOSTNAME}
        - COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-mailcow-dockerized}
        - IPV4_NETWORK=${IPV4_NETWORK:-172.22.1}
        - IP_BY_DOCKER_API=${IP_BY_DOCKER_API:-0}
        - CHECK_UNBOUND=${CHECK_UNBOUND:-1}
        - SKIP_CLAMD=${SKIP_CLAMD:-n}
        - SKIP_OLEFY=${SKIP_OLEFY:-n}
        - SKIP_LETS_ENCRYPT=${SKIP_LETS_ENCRYPT:-n}
        - SKIP_SOGO=${SKIP_SOGO:-n}
        - HTTPS_PORT=${HTTPS_PORT:-443}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
        - EXTERNAL_CHECKS_THRESHOLD=${EXTERNAL_CHECKS_THRESHOLD:-1}
        - NGINX_THRESHOLD=${NGINX_THRESHOLD:-5}
        - UNBOUND_THRESHOLD=${UNBOUND_THRESHOLD:-5}
        - REDIS_THRESHOLD=${REDIS_THRESHOLD:-5}
        - MYSQL_THRESHOLD=${MYSQL_THRESHOLD:-5}
        - MYSQL_REPLICATION_THRESHOLD=${MYSQL_REPLICATION_THRESHOLD:-1}
        - SOGO_THRESHOLD=${SOGO_THRESHOLD:-3}
        - POSTFIX_THRESHOLD=${POSTFIX_THRESHOLD:-8}
        - POSTFIX_TLSPOL_THRESHOLD=${POSTFIX_TLSPOL_THRESHOLD:-8}
        - CLAMD_THRESHOLD=${CLAMD_THRESHOLD:-15}
        - DOVECOT_THRESHOLD=${DOVECOT_THRESHOLD:-12}
        - DOVECOT_REPL_THRESHOLD=${DOVECOT_REPL_THRESHOLD:-20}
        - PHPFPM_THRESHOLD=${PHPFPM_THRESHOLD:-5}
        - RATELIMIT_THRESHOLD=${RATELIMIT_THRESHOLD:-1}
        - FAIL2BAN_THRESHOLD=${FAIL2BAN_THRESHOLD:-1}
        - ACME_THRESHOLD=${ACME_THRESHOLD:-1}
        - RSPAMD_THRESHOLD=${RSPAMD_THRESHOLD:-5}
        - OLEFY_THRESHOLD=${OLEFY_THRESHOLD:-5}
        - MAILQ_THRESHOLD=${MAILQ_THRESHOLD:-20}
        - MAILQ_CRIT=${MAILQ_CRIT:-30}
        - DEV_MODE=${DEV_MODE:-n}
      networks:
        mailcow-network:
          aliases:
            - watchdog

    dockerapi-mailcow:
      image: ghcr.io/mailcow/dockerapi:2.11
      security_opt:
        - label=disable
      restart: always
      dns:
        - ${IPV4_NETWORK:-172.22.1}.254
      environment:
        - DBROOT=${DBROOT}
        - TZ=${TZ}
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - REDISPASS=${REDISPASS}
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock:ro
      networks:
        mailcow-network:
          aliases:
            - dockerapi

    olefy-mailcow:
      image: ghcr.io/mailcow/olefy:1.15
      restart: always
      environment:
        - TZ=${TZ}
        - OLEFY_BINDADDRESS=0.0.0.0
        - OLEFY_BINDPORT=10055
        - OLEFY_TMPDIR=/tmp
        - OLEFY_PYTHON_PATH=/usr/bin/python3
        - OLEFY_OLEVBA_PATH=/usr/bin/olevba
        - OLEFY_LOGLVL=20
        - OLEFY_MINLENGTH=500
        - OLEFY_DEL_TMP=1
        - SKIP_OLEFY=${SKIP_OLEFY:-n}
      networks:
        mailcow-network:
          aliases:
            - olefy

    ofelia-mailcow:
      image: mcuadros/ofelia:latest
      restart: always
      command: daemon --docker -f label=com.docker.compose.project=${COMPOSE_PROJECT_NAME}
      environment:
        - TZ=${TZ}
        - COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}
      depends_on:
        - sogo-mailcow
        - dovecot-mailcow
      labels:
        ofelia.enabled: "true"
      security_opt:
        - label=disable
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock:ro
      networks:
        mailcow-network:
          aliases:
            - ofelia

networks:
  mailcow-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: br-mailcow
    enable_ipv6: ${ENABLE_IPV6:-true}
    ipam:
      driver: default
      config:
        - subnet: ${IPV4_NETWORK:-172.22.1}.0/24
        - subnet: ${IPV6_NETWORK:-fd4d:6169:6c63:6f77::/64}

volumes:
  vmail-vol-1:
  vmail-index-vol-1:
  mysql-vol-1:
  mysql-socket-vol-1:
  redis-vol-1:
  rspamd-vol-1:
  postfix-vol-1:
  postfix-tlspol-vol-1:
  crypt-vol-1:
  sogo-web-vol-1:
  sogo-userdata-backup-vol-1:
  clamd-db-vol-1:

```

---

## hrms

### hrms/docker/docker-compose.yml
```yaml
version: "3.8" # Updated version
services:
  mariadb:
    image: mariadb:10.8
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --skip-character-set-client-handshake
      - --skip-innodb-read-only-compressed # Temporary fix for MariaDB 10.6
    environment:
      MYSQL_ROOT_PASSWORD: 123
    volumes:
      - mariadb-data:/var/lib/mysql

  redis:
    image: redis:alpine

  frappe:
    image: frappe/bench:latest
    command: bash /workspace/init.sh
    environment:
      - SHELL=/bin/bash
    working_dir: /home/frappe
    volumes:
      - .:/workspace
    ports:
      - 8000:8000
      - 9000:9000

volumes:
  mariadb-data:

```

### hrms/docker/init.sh
```bash
#!bin/bash

if [ -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo "Bench already exists, skipping init"
    cd frappe-bench
    bench start
else
    echo "Creating new bench..."
fi

export PATH="${NVM_DIR}/versions/node/v${NODE_VERSION_DEVELOP}/bin/:${PATH}"

bench init --skip-redis-config-generation frappe-bench

cd frappe-bench

# Use containers instead of localhost
bench set-mariadb-host mariadb
bench set-redis-cache-host redis://redis:6379
bench set-redis-queue-host redis://redis:6379
bench set-redis-socketio-host redis://redis:6379

# Remove redis, watch from Procfile
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

bench get-app erpnext
bench get-app hrms

bench new-site hrms.localhost \
--force \
--mariadb-root-password 123 \
--admin-password admin \
--no-mariadb-socket

bench --site hrms.localhost install-app hrms
bench --site hrms.localhost set-config developer_mode 1
bench --site hrms.localhost enable-scheduler
bench --site hrms.localhost clear-cache
bench use hrms.localhost

bench start
```

