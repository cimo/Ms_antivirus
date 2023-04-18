FROM node:18.13.0

ARG VERSION_TAG
ARG ENV_NAME
ARG DOMAIN
ARG MS_A_SERVER_PORT

ENV VERSION_TAG=${VERSION_TAG}
ENV ENV_NAME=${ENV_NAME}
ENV DOMAIN=${DOMAIN}
ENV MS_A_SERVER_PORT=${MS_A_SERVER_PORT}

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS=yes
ENV TZ="Asia/Tokyo"

COPY ./ /home/root/

RUN cd ~ \
    # No root
    && userdel node \
    && groupadd -g 1000 clamav \
    && useradd -d /home/root/ -s /bin/bash -u 1000 -g 1000 clamav \
    && mkdir -p /home/root/ \
    && chown -R clamav:clamav /home/root/ /usr/local/lib/node_modules/ \
    && chmod 775 /home/root/ /usr/local/lib/node_modules/ \
    # Apt
    && apt-get update && apt-get install -y \
    clamav-daemon \
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

CMD service clamav-daemon restart \
    && service clamav-daemon status \
    && node /home/root/dist/Controller/Server.js

EXPOSE ${MS_A_SERVER_PORT}
