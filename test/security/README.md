# Security Testing with OWASP ZAP

This directory serves as the baseline for security testing using the OWASP ZAP scanner.

## Execution Requirements
ZAP requires Java or a Docker container to run properly. We recommend the Docker approach in CI/CD.

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://host.docker.internal:3000
```
