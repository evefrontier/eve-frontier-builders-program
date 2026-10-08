#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "usage: $0 <app-id> <branch-name> <site-dir> <stage>" >&2
  exit 2
fi

app_id="$1"
branch="$2"
site_dir="$3"
stage="$4"

if [ ! -f "$site_dir/index.html" ]; then
  echo "error: $site_dir/index.html not found; is the build output there?" >&2
  exit 1
fi

if ! aws amplify get-branch --app-id "$app_id" --branch-name "$branch" >/dev/null 2>&1; then
  echo "Creating Amplify branch $branch (stage $stage)"
  aws amplify create-branch --app-id "$app_id" --branch-name "$branch" \
    --stage "$stage" >/dev/null
fi

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
archive="$work_dir/site.zip"
(cd "$site_dir" && zip -qr "$archive" .)

read -r job_id upload_url < <(
  aws amplify create-deployment --app-id "$app_id" --branch-name "$branch" \
    --query '[jobId, zipUploadUrl]' --output text
)

curl --fail --silent --show-error --request PUT \
  --header "Content-Type: application/zip" --upload-file "$archive" "$upload_url"

aws amplify start-deployment --app-id "$app_id" --branch-name "$branch" \
  --job-id "$job_id" >/dev/null
echo "Started Amplify job $job_id on branch $branch"

for _ in $(seq 1 120); do
  status="$(aws amplify get-job --app-id "$app_id" --branch-name "$branch" \
    --job-id "$job_id" --query 'job.summary.status' --output text)"
  case "$status" in
    SUCCEED)
      echo "Amplify job $job_id succeeded"
      exit 0
      ;;
    FAILED | CANCELLED)
      echo "error: Amplify job $job_id ended with status $status" >&2
      exit 1
      ;;
  esac
  sleep 5
done

echo "error: timed out waiting for Amplify job $job_id (last status: $status)" >&2
exit 1
