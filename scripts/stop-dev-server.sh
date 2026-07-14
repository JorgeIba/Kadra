#!/bin/sh

project_root=$(pwd -P)
stopped=0

for proc_dir in /proc/[0-9]*; do
  pid=${proc_dir#/proc/}

  if [ ! -r "$proc_dir/cmdline" ]; then
    continue
  fi

  cmdline=$(tr '\0' ' ' < "$proc_dir/cmdline")
  proc_cwd=$(readlink -f "$proc_dir/cwd" 2>/dev/null || true)

  case "$cmdline" in
    *"pnpm dev"*|*"vite/bin/vite.js"*)
      case "$proc_cwd:$cmdline" in
        "$project_root":*|*"$project_root"*)
          kill "$pid" 2>/dev/null || true
          stopped=1
          echo "Stopped dev server process $pid"
          ;;
      esac
      ;;
  esac
done

if [ "$stopped" -eq 0 ]; then
  echo "No Kadra dev server process found."
fi
