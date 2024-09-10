Fetches homes from Holland2Stay.com and notifies by email if any new bokable entry is added

### Prepare:

```
git clone git@github.com:aghArdeshir/h2sbot.git
cd h2sbot
cp .env.example .env
vim .env # and modify
npm i
```

# Run:
```
node index.mjs
```

or to run every 10 minutes:
```
while true ; do node index.mjs ; echo sleeping ; sleep 600 ; done
```
