#!/usr/bin/env python3
"""
Build the full website bundle, including Dialoguer and InventoryManager artifacts.

Modes:
- ci: deterministic install steps for CI providers (npm ci + pip install)
- local: faster local iteration (skip dependency install when possible)
"""

from __future__ import annotations

import argparse
import importlib.util
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
DIALOGUER_REPO_DIR = ROOT_DIR / "external" / "MounteaDialoguer"
DIALOGUER_DIST_DIR = DIALOGUER_REPO_DIR / "dist"
DIALOGUER_APP_DIR = ROOT_DIR / "dialoguer" / "app"
INVENTORY_MANAGER_REPO_DIR = ROOT_DIR / "external" / "InventoryManager"
INVENTORY_MANAGER_DIST_DIR = INVENTORY_MANAGER_REPO_DIR / "dist"
INVENTORY_MANAGER_APP_DIR = ROOT_DIR / "page" / "inventour" / "app"

def run_command(command: list[str], cwd: Path | None = None) -> None:
    location = cwd or ROOT_DIR
    if sys.platform.startswith("win") and command and command[0] == "npm":
        command = ["npm.cmd", *command[1:]]
    print(f"[build] {' '.join(command)}")
    env = dict(os.environ)
    env.setdefault("PYTHONUTF8", "1")
    env.setdefault("PYTHONIOENCODING", "utf-8")
    subprocess.run(command, cwd=str(location), check=True, env=env)


def remove_generated_dialoguer_output() -> None:
    if DIALOGUER_APP_DIR.exists():
        shutil.rmtree(DIALOGUER_APP_DIR)


def remove_generated_inventory_manager_output() -> None:
    if INVENTORY_MANAGER_APP_DIR.exists():
        shutil.rmtree(INVENTORY_MANAGER_APP_DIR)


def copy_dialoguer_dist() -> None:
    if not DIALOGUER_DIST_DIR.exists():
        raise FileNotFoundError(
            f"Dialoguer dist directory not found: {DIALOGUER_DIST_DIR}"
        )

    DIALOGUER_APP_DIR.mkdir(parents=True, exist_ok=True)

    for item in DIALOGUER_DIST_DIR.iterdir():
        destination = DIALOGUER_APP_DIR / item.name
        if destination.exists():
            if destination.is_dir():
                shutil.rmtree(destination)
            else:
                destination.unlink()

        if item.is_dir():
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def copy_inventory_manager_dist() -> None:
    if not INVENTORY_MANAGER_DIST_DIR.exists():
        raise FileNotFoundError(
            f"InventoryManager dist directory not found: {INVENTORY_MANAGER_DIST_DIR}"
        )

    INVENTORY_MANAGER_APP_DIR.mkdir(parents=True, exist_ok=True)

    for item in INVENTORY_MANAGER_DIST_DIR.iterdir():
        destination = INVENTORY_MANAGER_APP_DIR / item.name
        if destination.exists():
            if destination.is_dir():
                shutil.rmtree(destination)
            else:
                destination.unlink()

        if item.is_dir():
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def has_module(module_name: str) -> bool:
    return importlib.util.find_spec(module_name) is not None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build website and Dialoguer bundle together."
    )
    parser.add_argument(
        "--mode",
        choices=["ci", "local"],
        default="local",
        help="Use 'ci' for deterministic installs, 'local' for faster iteration.",
    )
    parser.add_argument(
        "--dialoguer-base",
        default="/dialoguer/app/",
        help="Base path passed to Dialoguer Vite build (default: /dialoguer/app/).",
    )
    parser.add_argument(
        "--inventory-manager-base",
        default="/page/inventour/app/",
        help="Base path passed to InventoryManager Vite build (default: /page/inventour/app/).",
    )
    parser.add_argument(
        "--skip-submodule-update",
        action="store_true",
        help="Skip git submodule init/update step.",
    )
    parser.add_argument(
        "--submodule-remote",
        action="store_true",
        help="Update submodules to their remote-tracking branches.",
    )
    parser.add_argument(
        "--skip-mkdocs",
        action="store_true",
        help="Skip MkDocs documentation builds.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    is_ci_mode = args.mode == "ci"

    if not args.skip_submodule_update:
        submodule_update_command = [
            "git",
            "submodule",
            "update",
            "--init",
            "--recursive",
        ]
        if args.submodule_remote:
            submodule_update_command.append("--remote")
        run_command(submodule_update_command)

    if is_ci_mode:
        run_command(["npm", "ci", "--prefix", str(DIALOGUER_REPO_DIR)])
    else:
        node_modules_dir = DIALOGUER_REPO_DIR / "node_modules"
        if node_modules_dir.exists():
            print("[build] local mode: reusing existing Dialoguer node_modules")
        else:
            run_command(["npm", "ci", "--prefix", str(DIALOGUER_REPO_DIR)])

    if is_ci_mode:
        run_command(["npm", "ci", "--prefix", str(INVENTORY_MANAGER_REPO_DIR)])
    else:
        node_modules_dir = INVENTORY_MANAGER_REPO_DIR / "node_modules"
        if node_modules_dir.exists():
            print("[build] local mode: reusing existing InventoryManager node_modules")
        else:
            run_command(["npm", "ci", "--prefix", str(INVENTORY_MANAGER_REPO_DIR)])

    run_command(
        [
            "npm",
            "run",
            "build",
            "--prefix",
            str(DIALOGUER_REPO_DIR),
            "--",
            f"--base={args.dialoguer_base}",
        ]
    )

    run_command(
        [
            "npm",
            "run",
            "build",
            "--prefix",
            str(INVENTORY_MANAGER_REPO_DIR),
            "--",
            f"--base={args.inventory_manager_base}",
        ]
    )

    remove_generated_dialoguer_output()
    copy_dialoguer_dist()
    remove_generated_inventory_manager_output()
    copy_inventory_manager_dist()

    if not args.skip_mkdocs:
        if is_ci_mode:
            run_command(
                [sys.executable, "-m", "pip", "install", "mkdocs", "mkdocs-material"]
            )
        elif not (has_module("mkdocs") and has_module("material")):
            print("[build] local mode: installing missing MkDocs dependencies")
            run_command(
                [sys.executable, "-m", "pip", "install", "mkdocs", "mkdocs-material"]
            )
        run_command(
            [sys.executable, "-m", "mkdocs", "build", "--config-file", "mkdocs.yml"]
        )
        run_command(
            [sys.executable, "-m", "mkdocs", "build", "--config-file", "blog.yml"]
        )

    print("[build] Combined build completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
