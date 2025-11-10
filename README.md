# Ms_antivirus

Microservice antivirus.

Depend from "Ms_cronjob" (use "ms_cronjob-volume" for share the certificate).
It's possible to use a personal certificate instead of "Ms_cronjob", just add the certificate in the ".ms_cronjob-volume" folders.

## Info:

-   ClamAV

## Installation

1. For build and up write on terminal:

```
bash docker/container_execute.sh "local" "build-up"
```

2. Just for up write on terminal:

```
bash docker/container_execute.sh "local" "up"
```

## Reset

1. Remove this from the root:

    - .npm
    - node_modules
    - package-lock.json

2. Follow the "Installation" instructions.

## Api (Postman)

1. Info

```
url = https://localhost:1042/info
method = GET
```

2. Login

```
url = https://localhost:1042/login
method = GET
```

3. Update

```
url = https://localhost:1042/api/update
method = GET
```

4. Check

```
url = https://localhost:1042/api/check
method = POST

form-data

key             value
---             ---
file            "upload field"
```

5. Logout

```
url = https://localhost:1042/logout
method = GET
```
