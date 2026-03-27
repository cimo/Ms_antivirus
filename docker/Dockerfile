FROM ubuntu:24.04

ARG _ENV_NAME
ARG _DOMAIN
ARG _TIME_ZONE
ARG _LANG
ARG _SERVER_PORT
ARG _PATH_ROOT
ARG _PATH_CERTIFICATE_PEM
ARG _VERSION_TAG

ENV ENV_NAME=${_ENV_NAME}
ENV DOMAIN=${_DOMAIN}
ENV TZ=${_TIME_ZONE}
ENV LANG=${_LANG}
ENV SERVER_PORT=${_SERVER_PORT}
ENV PATH_ROOT=${_PATH_ROOT}
ENV PATH_CERTIFICATE_PEM=${_PATH_CERTIFICATE_PEM}
ENV VERSION_TAG=${_VERSION_TAG}

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS=yes
ENV SUDO_FORCE_REMOVE=yes
ENV HISTFILE="/home/clamav/.bash_history"
ENV NODE_OPTIONS=--use-openssl-ca
ENV NODE_EXTRA_CA_CERTS="${PATH_CERTIFICATE_PEM}"
ENV NPM_CONFIG_USERCONFIG="/home/clamav/.npmrc"

COPY ./certificate/ /usr/local/share/ca-certificates/
COPY ./docker/font/ /usr/share/fonts/truetype/noto/
COPY ./docker/font.conf /etc/fonts/local.conf
COPY ./ ${PATH_ROOT}

RUN cd ~ \
    # No root
    && userdel -r ubuntu \
    && groupadd -g 1000 clamav \
    && useradd -m -u 1000 -g 1000 -d ${PATH_ROOT} -s /bin/bash clamav \
    && uid="$(id -u clamav)" \
    && mkdir -p ${PATH_ROOT} /home/clamav/ /run/user/${uid} \
    && chown -R clamav:clamav ${PATH_ROOT} /home/clamav/ /run/user/${uid} \
    && chmod -R 775 ${PATH_ROOT} /home/clamav/ \
    && chmod -R 700 /run/user/${uid} \
    # Update
    && echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80-retries \
    && echo 'Acquire::http::No-Cache "true";' > /etc/apt/apt.conf.d/99no-cache \
    && echo 'Acquire::https::No-Cache "true";' >> /etc/apt/apt.conf.d/99no-cache \
    && VERSION_CODENAME=$(grep VERSION_CODENAME= /etc/os-release | cut -d= -f2) \
    && chmod -R 0644 /usr/local/share/ca-certificates/ \
    && apt-get update && apt-get install -y ca-certificates tzdata curl media-types jq gettext-base lynx \
    && update-ca-certificates \
    && ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone \
    && echo "application/typescript ts" >> /etc/mime.types \
    # NodeJs
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get update && apt-get install -y \
    nodejs \
    # ClamAV
    && apt-get update && apt-get install -y \
    clamav-daemon \
    && freshclam \
    && mkdir -p /run/clamav/ /var/run/clamav/ /var/lib/clamav/ /etc/clamav/ \
    && chown -R clamav:clamav /run/clamav/ /var/run/clamav/ /var/lib/clamav/ /etc/clamav/ \
    && chmod -R 775 /run/clamav/ /var/run/clamav/ /var/lib/clamav/ /etc/clamav/ \
    # Clean
    && apt-get remove --purge -y sudo \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean -y \
    && apt-get autoclean -y \
    && apt-get autoremove -y

USER clamav

WORKDIR ${PATH_ROOT}

RUN \
    # Npm
    bash ${PATH_ROOT}script/npm.sh "build"

CMD ["sh", "-c", "bash ${PATH_ROOT}script/clamav.sh && bash ${PATH_ROOT}script/nodejs.sh"]

EXPOSE ${SERVER_PORT}
