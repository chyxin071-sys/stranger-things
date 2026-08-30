# CloudBase Deployment

This project is deployed with Tencent CloudBase static hosting plus one CloudBase function.

## Current URLs

- Custom domain: <https://stranger.pinnuozhujia.cn/>
- Default CloudBase domain: <https://cloud1-8grodf5s3006f004-1421470557.tcloudbaseapp.com/>
- Private stats page: <https://stranger.pinnuozhujia.cn/?stats=1>

## CloudBase Resources

- Environment: `cloud1-8grodf5s3006f004`
- Static hosting path: `/`
- Function: `letter-wall-room`
- Database collection: `letter_wall_rooms`
- Authentication: anonymous login enabled

The same collection stores normal room documents and one internal stats document with id `STATS`.

## Required Console Settings

Enable anonymous login in CloudBase authentication.

Create or keep the document database collection:

```text
letter_wall_rooms
```

For this prototype, allow anonymous clients to read/write through the CloudBase app. The room operations also go through the `letter-wall-room` cloud function.

Add the web security domains used by the site:

```text
stranger.pinnuozhujia.cn
cloud1-8grodf5s3006f004-1421470557.tcloudbaseapp.com
stranger-things-cloud1-8grodf5s3006f004.webapps.tcloudbase.com
localhost
127.0.0.1
192.168.2.105
```

## Deploy Function

```bash
npx -p @cloudbase/cli@3.8.1 tcb fn deploy --all --force -e cloud1-8grodf5s3006f004
```

## Deploy Static Site

```bash
npm run lint
npm run build:cloudbase
npx -p @cloudbase/cli@3.8.1 tcb hosting deploy ./dist / -e cloud1-8grodf5s3006f004
```

## CloudBase Git Deployment

If using CloudBase Git deployment, use:

```text
Framework: other
Node.js: 18 or newer
Target directory: ./
Install command: npm ci
Build command: npm run build:cloudbase
Deploy command: tcb hosting deploy ./dist /
```

If the console has a separate build output field, set it to:

```text
./dist
```

## Why `dist` Errors Happen

CloudBase clones the repository fresh during deployment. The `dist/` directory is generated and ignored by git, so it does not exist until the build command runs.

If deployment says:

```text
Path does not exist: /root/cloudbase-workspace/dist
```

the deploy step ran before `npm run build:cloudbase`.

## Room And Stats Flow

The desktop page calls `letter-wall-room` to create or reuse a room.

The phone receiver polls the same room and sends a heartbeat so the desktop can show how many devices are connected.

When the desktop sends a message, the cloud function writes the message into the room document, and all connected phones pick it up.

The hidden stats page reads the internal `STATS` document through the same cloud function. The stats page itself is not counted as a visit.
