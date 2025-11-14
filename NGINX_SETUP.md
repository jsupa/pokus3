# Nginx Development Setup Guide

This guide will help you set up nginx for local development to handle CORS issues by routing all requests through nginx.

## Docker Setup (Recommended)

The nginx service is already configured in `docker-compose.yml` and will start automatically with your dev container.

### 1. Add Local Domains to /etc/hosts

Edit your hosts file:

```bash
sudo nano /etc/hosts
```

Add these lines:

```
127.0.0.1    dashboard.pokus.local
127.0.0.1    api.pokus.local
```

Save and exit (Ctrl+X, then Y, then Enter in nano).
