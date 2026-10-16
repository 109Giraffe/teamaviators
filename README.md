# Team Aviators website

A responsive dark navy, blue and purple homepage for Team Aviators, the storm-chasing and gaming community. It features a storm-themed hero, links to Twisted, Stormworks and Kerbal Space Program, a server status panel, and the existing Discord invite.

## Files
- `index.html` — page structure and content
- `style.css` — responsive styling
- `script.js` — mobile navigation and status feed polling

## Deploy on the Ubuntu Apache VPS

The root IP website should remain in `/var/www/html`. Put this site in `/var/www/teamaviators` and configure a separate Apache virtual host for `teamaviators.co.uk` and `www.teamaviators.co.uk`.

The dashboard reads the existing public JSON feeds from the IP website. Add these aliases inside **both** the HTTP and HTTPS virtual-host blocks for the Team Aviators domain, so the files stay in the original document root:

```apache
Alias /status.json /var/www/html/status.json
Alias /players.json /var/www/html/players.json
Alias /luna_players.json /var/www/html/luna_players.json

<Directory /var/www/html>
    Require all granted
</Directory>
```

Then validate and reload Apache:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Ensure the Team Aviators virtual host uses `DocumentRoot /var/www/teamaviators` and has a matching `<Directory /var/www/teamaviators>` block with `Require all granted`.

## Notes
- The Twisted card links to Roblox's games directory because a specific game URL has not been configured yet.
- The Stormworks and KSP status indicators use the existing JSON feeds. If a feed is unavailable or stale, the page shows an unavailable state rather than guessing.
- Logo assets are loaded from the existing public `109Giraffe/82.165.54.22` repository.
- Discord invite: https://discord.gg/yEB6D96JBm
