# Deployment

The website is built as a static export and hosted on AWS Amplify. GitHub Actions does the builds and deploys.

## Ship changes

1. Open a pull request against main.
2. ci.yml lints and builds the site. If that passes, the build is published as a preview at https://pr-number.app-id.amplifyapp.com. The link appears on the pull request.
3. Get a review and merge. The push to main runs CI again and publishes that build to production.
4. When the pull request closes, the preview gets deleted.

Pull requests from forks and from Dependabot are linted and built but get no preview, cause they can't use the deploy creds.

To redeploy production without a new commit, run the CI workflow manually on main.

## Security Headers

/web/customHttp.yml is the source of truth for the response headers on the live site. The production deploy applies it to the Amplify app and it fails if the headers are missing from the live response.
The headers are app wide, so a change to that file only happens when it reaches main.

## Review Rules

CODEOWNERS lets either evefrontier/builders-program or evefrontier/product-apps approve changes. Changes to .github/, CODEOWNERS and web/customHttp.yml need a evefrontier/product-apps approval.

## Configuration

The workflows read these settings.

### Variables

Set on the repository.

- AMPLIFY_APP_ID: the Amplify app to deploy to. The deploy jobs are skipped while it is unset.
- AWS_REGION: the region of the Amplify app.
- SITE_URL: the production URL used for the header check. Optional; defaults to https://main.app-id.amplifyapp.com.

### Secrets

Set on each GitHub environment, not on the repository. Each environment has its own role.

- AWS_ROLE_ARN in the production environment: the role that deploys main and applies the security headers. Only the main branch can deploy to this environment.
- AWS_ROLE_ARN in the preview environment: the role that creates, deploys and deletes pr-* preview branches.

## Dependency Updates

Dependabot opens weekly pull requests for the npm packages in web/ and for GitHub Actions, and waits five days after a release before proposing it. Security updates are seperate.


