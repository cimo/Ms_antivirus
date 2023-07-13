FROM ubuntu:20.04

ARG _ENV_NAME
ARG _DOMAIN
ARG _TIMEZONE
ARG _SERVER_PORT
ARG _VERSION_TAG

ENV ENV_NAME=${_ENV_NAME}
ENV DOMAIN=${_DOMAIN}
ENV TZ=${_TIMEZONE}
ENV VERSION_TAG=${_VERSION_TAG}

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS=yes

COPY ./docker/nodejs_18_setup.sh /home/nodejs_18_setup.sh
COPY ./ /home/root/

RUN cd ~ \
    # NodeJs
    && bash /home/nodejs_18_setup.sh \
    && apt-get update && apt-get install -y nodejs \
    # No root
    && groupadd -g 1000 clamav \
    && useradd -d /home/root/ -s /bin/bash -u 1000 -g 1000 clamav \
    && mkdir -p /home/root/ /usr/local/lib/node_modules/ \
    && chown -R clamav:clamav /home/root/ /usr/local/lib/node_modules/ /usr/local/bin/ \
    && chmod 775 /home/root/ /usr/local/lib/node_modules/ /usr/local/bin/ \
    # Apt
    && apt-get update && apt-get install -y \
    ca-certificates \
    fonts-noto \
    fonts-noto-cjk \
    clamav-daemon \
    # Certificate
    && update-ca-certificates \
    # ClamAV
    && mkdir /var/run/clamav/ \
    && chown clamav:clamav /var/run/clamav/ /var/lib/clamav/ /run/clamav/ /etc/clamav/ \
    && chmod 775 /var/run/clamav/ /var/lib/clamav/ /run/clamav/ /etc/clamav/ \
    && freshclam \
    # Clean
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean -y \
    && apt-get autoclean -y \
    && apt-get autoremove -y

USER clamav

WORKDIR /home/root/

RUN npm install && npm run build

# ClamAV
CMD service clamav-daemon restart \
    && service clamav-daemon status \
    # Node
    && node /home/root/dist/controller/Server.js

EXPOSE ${_SERVER_PORT}
