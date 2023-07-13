# Ms_antivirus

Microservice antivirus.

Depend from Ms_cronjob (use the volume "ms_cronjob-volume" for share the certificate).

Rename "/env/local.env.public" in "/env/local.env" and adjust the variable for your environment.

## Setup WSL

1. Wrinte on terminal:

```
docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --build --pull "always"
```

2. If you have a proxy execute this command (if you use a certificate put it in "/certificate/proxy/" folder):

```
DOCKERFILE="Dockerfile_local_proxy" docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --build --pull "always"
```

## Setup DOCKER DESKTOP

1. Wrinte on terminal:

```
docker-compose -f docker-compose.yaml --env-file ./env/local.env up --detach --build --pull "always"
```

2. If you have a proxy execute this command (if you use a certificate put it in "/certificate/proxy/" folder):

```
DOCKERFILE="Dockerfile_local_proxy" docker-compose -f docker-compose.yaml --env-file ./env/local.env up --detach --build --pull "always"
```

## API (Postman)

1. Check

```
url = https://localhost:1001/msantivirus/check

form-data

key             value
---             ---
token_api       1234
file_name       Test_1.docx
file            "upload field"
```

2. Update

```
url = https://localhost:1001/msantivirus/update

raw / JSON

{
    "token_api": "1234"
}
```
